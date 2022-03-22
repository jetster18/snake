var pixels = 0;
var edgeGuard = 0;
//calculate width height
var gridWidth = 0;
var gridHeight = 0;
var highScore = 0;

window.addEventListener('load', () => {
  pixels = GetSnakeHead().offsetWidth;
  edgeGuard = (pixels);
  gridWidth = Math.floor(window.innerWidth - 200);
  gridHeight = Math.floor(window.innerHeight - 200);
  SetScreenSize();
  Reset();
  SetupCookieInfo();
});

function SetupCookieInfo(){
 highScore = GetCookie('highscore');
}

function Reset(){
  InitializeFood();
  SetScore(0);
}

function SetScreenSize(){

  // modulo by pixel size
  var rightMod = window.innerWidth % pixels; // 20 pixels too many (shave off on right side)
  var bottomMod = window.innerHeight % pixels; // shave off 80 pixels

  var gameWidth = window.innerWidth - rightMod - (2 * pixels);
  var gameHeight = window.innerHeight - bottomMod - (2 * pixels);

  var elem = document.getElementById('border');
  elem.style.border = '100px solid var(--border-color)';
  elem.style.width = gameWidth + 'px';
  elem.style.height = gameHeight + 'px';
  

  elem.style.borderBottom = bottomMod + 100 + 'px solid var(--border-color)';
  elem.style.borderRight = rightMod + 100 + 'px solid var(--border-color)'



    /* width: calc(100% - 200px);//let's calculate this in javascript 
  height: 700px;
  border: 100px solid var(--border-color);
  border-bottom: 190px solid var(--border-color);
  border-right: 120px solid var(--border-color); */

}


//IDEA TIME 

//make it a speed run

//fill map with 'fake' food
//make food that can poison
//quickest time to 20 length wins
function RemoveAllWithClassName(className){
  Array.from(document.getElementsByClassName(className)).forEach((item) =>{
    item.remove();
  })
}

function FillMapWithFakeFood(amountOfFood){


  var bodyParts = GetSnakeBodyParts();

  RemoveAllWithClassName('fake-food');

  for (var i = 0; i < amountOfFood; i++){
    var elem = document.createElement('div');
    elem.classList.add("snake-food");
    elem.classList.add("fake-food");

    //fake food color

    var redness = bodyParts.length * 15;
    if (redness > 170){
      redness = 170;
    }

    elem.style.backgroundColor = 'rgba(' + redness + ', 0, 0)'

    var xPos = Math.ceil(Math.random() * ((gridWidth / 100) - 1))
    var yPos = Math.ceil(Math.random() * ((gridHeight / 100) - 1))
    elem.style.transform = "translate(" + xPos * 100 + "px,"+ yPos * 100 + "px)"
    document.body.appendChild(elem);
  }
}

function InitializeFood(){

  var snakeBodyParts = GetSnakeBodyParts();
  RemoveAllWithClassName('snake-food');

  FillMapWithFakeFood(snakeBodyParts.length / 5); // determine fake food by size of snake 
  var elem = document.createElement('div');
  elem.classList.add("snake-food");

  var lookingForFoodPosition = true;

  while(lookingForFoodPosition){
    var xPos = Math.ceil(Math.random() * ((gridWidth / 100) - 1))
    var yPos = Math.ceil(Math.random() * ((gridHeight / 100) - 1))
    elem.style.transform = "translate(" + xPos * 100 + "px,"+ yPos * 100 + "px)"

    if (snakeBodyParts.length == 0){
      //let's just do it.
      lookingForFoodPosition = false;
    }else{

    for (var i = 0; i < snakeBodyParts.length; i++){
      if (snakeBodyParts[i].style.transform != elem.style.transform){
        lookingForFoodPosition = false;
      }else {
        lookingForFoodPosition = true;
        break;
      }
    }
  }
  }

  document.body.appendChild(elem);
}


document.addEventListener('keydown', function(event){
  if (event.keyCode==37){
    //left
    MoveSnake(0-pixels, 0);
  }
   if (event.keyCode == 39){
    //right
    MoveSnake(pixels,0);
  }
   if (event.keyCode == 38){
    //down
    MoveSnake(0, 0-pixels);
  }
   if (event.keyCode == 40){
    //up
    MoveSnake(0, pixels);
  }
  if (event.keyCode == 80){
    //p
    IncreaseSnakeLength();
  }
})

function DetectCollision(){
  var bodyParts = GetSnakeBodyParts();
  var head = GetSnakeHead();
  var food = GetSnakeFood();
  var isEatingFood = false;

  if (head.style.transform == food.style.transform && bodyParts.length == 0){
    //head is colliding with snake
    isEatingFood = true;
  }
  
  for (var i = 0; i < bodyParts.length; i++){
    if (head.style.transform == bodyParts[i].style.transform){
      //ate itself
      ClearSnakeSize();
    }else if (head.style.transform == food.style.transform) {
      //hurray ate food
      isEatingFood = true;
    }
  }

  var fakeFood = GetFakeFood();

  for (var i = 0; i < fakeFood.length ; i++){
    if (head.style.transform == fakeFood[i].style.transform){
      //whoops, at a bad food. remove snake tail
      DecreaseSnakeLength();
      fakeFood[i].remove();
      break;
    }
  }

  if (isEatingFood){
    food.remove();
    InitializeFood();
    IncreaseSnakeLength();
  }
}

function MoveSnake(x, y){
  //instead of adding them, update the translation total with  document.getElementsByClassName("snake-head")[0].getBoundingClientRect()
  var rectangle = GetSnakeHead().getBoundingClientRect();
  var deltaX = rectangle.x;
  var deltaY = rectangle.y;
  
  //try and remove the weirdness. if X is positive, add the pixels
  if (x > 0){
    //+50
    deltaX += pixels;
  }else if (x < 0){
    //-pixelspx
    deltaX -= pixels;
  }else if (y > 0){
    //+pixels
    deltaY += pixels;
  }else if (y < 0){
    deltaY -=pixels;
  }


  // var deltaX = ((rectangle.x + x) / pixels) * pixels;
  // var deltaY = ((rectangle.y + y) / pixels) * pixels;
  
  //keep contained in the screen
  //let's say width of the block + 1

  // if (deltaX / pixels < gridWidth && deltaX > edgeGuard && deltaY < window.innerHeight - edgeGuard && deltaY > edgeGuard)
  if (deltaX < gridWidth && deltaX > 0 && deltaY < gridHeight && deltaY > 0)
  {
    CascadeSnakeBodyMovement();
    GetSnakeHead().style.transform = "translate(" + deltaX + "px, " + deltaY + "px)";
    // console.log('snake head moved to: X: ' + deltaX + ' Y: ' + deltaY);
    DetectCollision();
  }else {
    // console.log("too far off the page");
  }
}

function GetSnakeBodyParts(){
  return document.getElementsByClassName("snake-body");
}

function GetSnakeHead(){
  return document.getElementsByClassName("snake-head")[0];
}

function GetFakeFood(){
  return document.getElementsByClassName("fake-food");
}


function GetSnakeFood(){
  //Array.from(document.getElementsByClassName("snake-food"))[0].classList.toString().includes('fake-food')
  var count = 0; 
  var elem; 
  Array.from(document.getElementsByClassName("snake-food")).forEach((item) => {
    if (!item.classList.toString().includes('fake-food')){

      elem = document.getElementsByClassName("snake-food")[count];
    }
    count++;
  })
  return elem;
  // return document.getElementsByClassName("snake-food")[0];
}

function CascadeSnakeBodyMovement(){
  var bodyParts = GetSnakeBodyParts();
  for (var i = bodyParts.length -1; i > 0; i-- ){
    bodyParts[i].style.transform = bodyParts[i-1].style.transform;
  }
  //set first body part
  if (bodyParts.length > 0){
    bodyParts[0].style.transform = GetSnakeHead().style.transform;
  }
}

function SetScore(score){
  document.getElementById("score").innerHTML = score;
  if (score > highScore){
    highScore = score;
  }
  document.getElementById('high-score').innerHTML = highScore;
  SetCookie("highscore", highScore, 30);
  // document.cookie = "highscore=" + highScore
}

function IncreaseSnakeLength(){
  PlaySound('nom-nom');
  var bodyParts = GetSnakeBodyParts();
  SetScore(bodyParts.length + 1);
  var elem = document.createElement('div');
  elem.classList.add("snake-body");
  elem.style.transform = bodyParts.length == 0 ? GetSnakeHead().style.transform : bodyParts[bodyParts.length-1].style.transform;
  document.body.appendChild(elem);
}


function DecreaseSnakeLength(){
  PlaySound('bad-food');
  var bodyParts = GetSnakeBodyParts();
  if (bodyParts.length > 0){
    bodyParts[bodyParts.length - 1].remove();
    SetScore(bodyParts.length);
  }
}


function ClearSnakeSize(){
  PlaySound('eat-yourself');
  document.querySelectorAll('.snake-body').forEach(box => {box.remove()})
  Reset();
}


function PlaySound(soundId){
  var elem = document.getElementById(soundId);
  elem.volume = 0.2;
  elem.play();
}

function GetCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function SetCookie(cName, cValue, expDays) {
  let date = new Date();
  date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = cName + "=" + cValue + "; " + expires + "; path=/ max-age=31536000";
}