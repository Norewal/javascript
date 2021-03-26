const express = require('express');

const { handleErrors } = require('./middlewares');
const usersRepo = require('../../repositories/users');
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");


const { requireEmail,
    requirePassword,
    requirePasswordConfirmation,
    requireEmailExists,
    requireValidPasswordForUser
} = require('./validators');

//subrouter to link our route handlers to index.js
// the router const, its an object to track all of our (app.get/post routes)
const router = express.Router();


router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
});


// first run the bodyParser(middleware) - function, and then the callback
router.post('/signup',
    [
        requireEmail,
        requirePassword,
        requirePasswordConfirmation
    ], handleErrors(signupTemplate),
    async (req, res) => {
        // console.log(req.body); // req.body = the names of the inputs
        const { email, password } = req.body;

        // Create a user, in our user repo
        const user = await usersRepo.create({ email, password });

        // Store the id of that user inside the users cookie
        // req.session === {}// Added by cookie session
        req.session.userId = user.id;

        res.redirect('/admin/products');
    }
);

router.get('/signout', (req, res) => {
    req.session = null;
    res.send("You are logged out");
});

router.get("/signin", (req, res) => {
    res.send(signinTemplate({}));
});

// compare the login data with the saved users data 
router.post(
    '/signin',
    [
        requireEmailExists,
        requireValidPasswordForUser
    ], handleErrors(signinTemplate),
    async (req, res) => {
        const { email } = req.body;

        const user = await usersRepo.getOneBy({ email });

        req.session.userId = user.id;
        res.redirect('/admin/products');
    });

module.exports = router;