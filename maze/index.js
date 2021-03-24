const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter; 


//const cells = 3;
const cellsHorizontal = 10;
const cellsVertical = 8;
const width = window.innerWidth;
const height = window.innerHeight;


const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;

const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false, //color
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

/*const shape = Bodies.rectangle(200, 200, 50, 50, {  //200 + 200 position; 50 + 50 width + height
    isStatic: true
});
World.add(world, shape); */



// ***** Walls ***** 
const walls = [
    Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true }),              //top horizontal line
    Bodies.rectangle(width / 2, height, width, 10, { isStatic: true }),         //bottom horizontal line
    Bodies.rectangle(0, height / 2 , 10, height, { isStatic: true }),           //left vertical line
    Bodies.rectangle(width, height / 2, 10, height, { isStatic: true }),        //right vertical line
];

World.add(world, walls);



// ***** Maze generation *****

/*const grid = [];

for (let i = 0; i < 3; i++) {
    grid.push([]);
    for (let y = 0; y < 3; y++) {
        grid[i].push(false);
    }
} 
console.log(grid); */

const shuffle = arr => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical -1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);
//console.log(grid, verticals, horizontals);
//console.log(startRow, startColumn);

const stepThroughCell = (row, column) => {
    // if i have visited the cells at [row, column], then return
    if (grid[row][column]) {
        return;
    }

    // Mark this cell as being visited
    grid[row][column] = true;

    // Assemble randomly-ordered list if neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);
    //console.log(neighbors);

    // For each neighbor...
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;

        // See if that neighbor is out of bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0|| nextColumn >= cellsHorizontal) {
            continue;
        }

        // if we have visited that neighbor, continue to next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        // Remove a wall from either horizontals or verticals
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        // Visit that next cell
        stepThroughCell(nextRow, nextColumn);
    }
};
//console.log(grid);
stepThroughCell(startRow, startColumn);


horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
    
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: '#8B32AD'
                }
            }
        );
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
    
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: '#CF61FA'
                }
            }
        );
        World.add(world, wall);
    });
});



// ***** Goal  ***** 
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
        label: 'goal',  
        isStatic: true,
        render: {
            fillStyle: '#30FF99'
        }
    }
);
World.add(world, goal);



// ***** Ball ***** 
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius, 
    { 
        label: 'ball',
        render: {
            fillStyle: '#FF5473'
        } 
    }       
);
World.add(world, ball);

document.addEventListener('keydown', event => {
    //console.log(event)
    const { x, y } = ball.velocity;
    //console.log(x, y);
    if (event.keyCode === 87) {
        //console.log('move ball up');
        Body.setVelocity(ball, { x, y: y - 5 });
    }
    if (event.keyCode === 68) {
        //console.log('move ball right');
        Body.setVelocity(ball, { x: x + 5, y });
    }
    if (event.keyCode === 83) {
        //console.log('move ball down');
        Body.setVelocity(ball, { x, y: y + 5 });
    }
    if (event.keyCode === 65) {
        //console.log('move ball left');
        Body.setVelocity(ball, { x: x - 5, y });
    }
});


// ***** Win Condition ***** 
Events.on(engine, 'collisionStart', event => {
    //console.log(event);
    event.pairs.forEach((collision) => {
        //console.log(collision);
        const labels = ['ball', 'goal'];

        if (
            labels.includes(collision.bodyA.label) && 
            (labels.includes(collision.bodyB.label))
        ) {
            //console.log('User Won!');
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});