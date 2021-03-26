const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

// promisify - return a version of the function that returns a prommise
const scrypt = util.promisify(crypto.scrypt);

// add "extends Repository" to get access to all of the Repository methods
class UsersRepository extends Repository {
    async comparePasswords(saved, supplied) {
        /// saved -> password saved in our database, "hashed.salt"
        /// supplied -> password given to us by the user trying to sign in
        // const result = saved.split('.');
        // const hashed = result[0];
        // const salt = result[1];

        const [hashed, salt] = saved.split('.'); // destructure..
        // combine supplied and salt, and hash them
        const hashedSuppliedBuf = await scrypt(supplied, salt, 64);
        // compare and return true or false
        return hashed === hashedSuppliedBuf.toString('hex');
    }

    async create(attrs) {
        // attrs === {email: "", password: ""};
        attrs.id = this.randomId();
        //get the current existing data{email: 'dsdass@dsfds.com', password: 'sdfds5435f'}

        // generate salt
        const salt = crypto.randomBytes(8).toString('hex');
        // return a hashed(buf) combination of pass and salt
        const buf = await scrypt(attrs.password, salt, 64);

        const records = await this.getAll();
        // push the new data back to records
        const record = { // replace the pass with the hashed one
            ...attrs,
            password: `${buf.toString('hex')}.${salt}`
        }
        records.push(record); // push the attributes.. with a hashed password

        await this.writeAll(records);

        return record; // get an object including the id for the user we made
    }
}

module.exports = new UsersRepository('users.json');




// const test = async () => {
//     const repo = new UsersRepository('users.json');

/// getOneBy / search -> filter by.. search by..
// const user = await repo.getOneBy({ name: "bela", id: "dsf3432" });
// console.log(user);

///update user
// await repo.update("dsf3432", { name: "bela" });

/// delete(filter) by id
// await repo.delete('dsf3432');

/// getOne by id
// const user = await repo.getOne("dsf3432");

//// create
// await repo.create({ email: 'test4@mail.com', password: 'secretpassword4' });
// const users = await repo.getAll();
// console.log(user);

// };

// test();