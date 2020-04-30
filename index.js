//Using matter.js library for creating the shapes.
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 3; //Declaringg the horizontal cells
const cellsVertical = 4; //Declaring Vertical Cells
const width = window.innerWidth; // making the width responsive for every screen using window.innerWidth to get the actual size of the screen
const height = window.innerHeight;// making the hieght responsive for every screen using window.innerHeight to get the actual size of the screen

const unitLengthX = width / cellsHorizontal;// calculating horizontal length of each cell
const unitLengthY = height / cellsVertical;// calculating vertical length of each cell

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true}),//creating the walls using rectangles for shapes to not move out of the screen side-top
  Bodies.rectangle(width / 2, height, width, 2,{isStatic: true}),//creating the walls using rectangles for shapes to not move out of the screen side-left
  Bodies.rectangle(0, height / 2, 2, height, {isStatic: true}),//creating the walls using rectangles for shapes to not move out of the screen side-bottom
  Bodies.rectangle(width, height / 2, 2, height, {isStatic: true})//creating the walls using rectangles for shapes to not move out of the screen side-right
];
World.add(world, walls); // adding the walls to the world

// Maze generation
//this function is created to generate maze so randomly it will shuffle the arr neighbors so based on the position of ball
//maze will shuffle and randomly will be new avaliable moves
/*const shuffle = (arr) => {
  let counter = arr.length;
  while(counter > 0){
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};*/

//creating the grid
const grid = Array(cellsVertical)
.fill(null)
.map(() => Array(cellsHorizontal).fill(false)); //Creating grid with the given cellsVertical and cellsHorizontal

const verticals = Array(cellsVertical) // creating the vertical lines
.fill(null)
.map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1) //creating the horizontal lines
.fill(null)
.map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical); /*Randomly will tell a startRow, math.random gives a number between 0 and 1
and we multiply it by the number of cellsVertical and with Math.floor we remove the decimals so if the cellsVertical is 3 , randomly only number 0,1,3 will be rendered to tell the start Postiion */
const startColumn = Math.floor(Math.random() * cellsHorizontal)//Randomly putting the startColumn

const stepThroughCell = (row, column) => {
  //If i have visited the cell at [row, column], then return
  if(grid[row][column]){
    return;
  }
  //Mark this cell as being visited
  grid[row][column] = true;

  //Assemble randomly-ordered list of neighbor
const neighbors = [   //Here we tell in which direction we will move based in the position we are.. we will use the function shuffle created above
   [row - 1, column, 'up'],  // this will move the ball up
   [row, column + 1, 'right'], //this will move the ball right
   [row + 1, column, 'down'], //this will move the ball down
   [row, column - 1, 'left'] //this will move the ball left
];
  //For each neighbor
  for(let neighbor of neighbors){
    const [nextRow, nextColumn, direction] = neighbor;

  //Se if the neighbor is out of bounds
  if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal){
    continue;
  }
  //If we have visited that neighbor, continue to next neighbor
  if(grid[nextRow][nextColumn]){
    continue;
  }
  //Remove the wall from either horizontals or verticals
  if(direction === 'left'){
    verticals[row][column - 1] = true; // if we want to move left the row will not change only the column
  } else if (direction === 'right'){
    verticals[row][column] = true;// if we want to move right the row and column will not change
  } else if(direction === 'up'){
    horizontals[row - 1][column] = true;// if we move up the column will not change only the row
  } else if(direction === 'down'){
    horizontals[row][column] = true; // if we move down the row and columns will not change
  }
  stepThroughCell(nextRow, nextColumn);//calling this function to check if nextrow or nextColumn is visited if not wil mark it as visited by addin true

}
  //Visit the next cell
};

stepThroughCell(startRow, startColumn);// randomly puting a start row or start column
//creating the horizontal walls
horizontals.forEach((row, rowIndex) => { // for each horizontal
  row.forEach((open, columnIndex) => { //we will iterate into array and will use open to see if the value is true or false
    if(open === true){ // if its true don't draw nothing just return
      return;
    }
    //otherwise
    const wall = Bodies.rectangle( //create a rectangle
      columnIndex * unitLengthX + unitLengthX / 2, // index of the column will be multiply by unitlength(width/cells) + unitlength/ 2 ( to put the ball in the middle of cell)
      rowIndex * unitLengthY + unitLengthY, //index of row multiply by the unitLengthY(height / cell) + unitlengthY
      unitLengthX,
      3,
      {
        label: 'wall', // adding this label property to use it when we detect a win to set the setStatic to false.
        isStatic: true,// making it static
        render: {
          fillStyle: 'red'//filing the line red
        }
      }
    );
    World.add(world, wall);//ading it to the wold
  });

});
//creating the vertical walls
verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if(open === true){
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      3,
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
        render:{
          fillStyle: 'red'
        }
      }
    );
    World.add(world, wall);
  });
});

//Addin the green rectangle as the goal
const goal = Bodies.rectangle( //creating the rectangle
  width - unitLengthX / 2, // putting rectangle in the last cell at right side
  height - unitLengthY / 2, // putting the rectangle in the last cell down
  unitLengthX * .7, //making the width and height to get 70% of the cell height and width
  unitLengthY * .7,
  {
    label: 'goal',//adding the label property to use it for detecting the win
    isStatic: true, //making staticl
    render: {
      fillStyle: 'green' //adding green color
    }
  }
);
World.add(world, goal); // adding it to the world

//Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4; // calculating the size of ball
const ball = Bodies.circle(
  unitLengthX / 2, // to put the ball in the first cell AND IN THE MIDDLE OF CELL
  unitLengthY / 2,
  ballRadius,
  {
    label: 'ball', //adding the label property to use it for detevting the win
    render: {
      fillStyle: 'blue'//making the ball blue
    }
  }
);
World.add(world, ball); //adding it to the world.


//Handling keypress to move the Ball
document.addEventListener('keydown', event => {
  const { x, y } = ball.velocity;

//up
  if(event.keyCode === 87){
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  //left
  if(event.keyCode === 65){
    Body.setVelocity(ball, { x: x - 5, y });
  }
  //down
  if(event.keyCode === 83){
    Body.setVelocity(ball, { x, y: y + 5 });
  }
  //right
  if(event.keyCode === 68){
     Body.setVelocity(ball, { x: x + 5, y });
  }
});

//Detecting a win
Events.on(engine, 'collisionStart', event => { //we will listen for collisionStart(collision is in this case when the ball runs into a wall) and will call a callback funcition
  event.pairs.forEach((collision) => { // so for each collision that will happen // event.pairs will put all the information of the collision that will happen
    //so it gives information about the BodyA and BodyB that made the collision
    const labels = ['ball', 'goal']; //

    if(labels.includes(collision.bodyA.label) && //checking if bodyA.label includes any of labels we declare above
       labels.includes(collision.bodyB.label) //checking if bodyB.label includes any of labels we declare above
     ){
       document.querySelector('.winner').classList.remove('hidden');// when we win the game we will remove the class hidden and the success message will show up
       document.querySelector('button').classList.remove('hidden');// when we win the game we will remove the class hidden and the New game message will show up
       const button = document.querySelector('button'); //selecting buttton
       button.addEventListener('click', event => { // when we click on button
         window.location.reload(true);//this event wil be called so the game will reload(true means realoding form server / false from chache)
       });
       world.gravity.y = 1; //adding gravity to the shapes, when the game is win they will fall.
       world.bodies.forEach(body => { //for each body in the world
         if(body.label === 'wall'){ //checking if the label is wall
           Body.setStatic(body, false); // if its true will remove the setstatic which is set to true
         }
       });
     }
  });
});
