

//Actor is anything the moves in the game
//object
var actorChars = {
  '@': Player,
  'o': Coin,
  'm': Meteor

};

function Level(plan) {
  // Use the length of a single row to set the width of the level
  this.width = plan[0].length;
  // Use the number of rows to set the height

  this.height = plan.length;

  // Store the individual tiles in our own, separate array
  this.grid = [];

  // store a list of actos to process each frame
  this.actors = [];//want to start keeping track of all the actors//anything active in game

  // Loop through each row in the plan, creating an array in our grid
  for (var y = 0; y < this.height; y++) {
    var line = plan[y], gridLine = [];

    // Loop through each array element in the inner array for the type of the tile
    for (var x = 0; x < this.width; x++) {
      // Get the type from that character in the string. It can be 'x', '!' or ' '
      // If the character is ' ', assign null.


      var ch = line[x], fieldType = null;
      // Use if and else to handle the three cases
      //is charcter an actor?
      var Actor = actorChars[ch];

      if(Actor)
        this.actors.push(new Actor(new Vector(x,y), ch));

      /*if (ch==='@')
        // Create a new player at that grid position.
        this.player = new Player(new Vector(x, y));*/ //not needed anymore

      else if (ch == "x")
        fieldType = "wall";
      // Because there is a third case (space ' '), use an "else if" instead of "else"
      else if (ch == "!")
        fieldType = "lava";
      else if (ch == "y")
          fieldType = "floater";

      // "Push" the fieldType, which is a string, onto the gridLine array (at the end).
      gridLine.push(fieldType);
    }
    // Push the entire row onto the array of rows.
    this.grid.push(gridLine);
  }
  this.player = this.actors.filter(function(actor) {
    return actor.type == "player";
  })[0];
}


// Check if level is finished/////////////////

Level.prototype.isFinished = function() {
  return this.status != null && this.finishDelay < 0;
};

///////////////////////////////////


//constructor
function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
  //speed if you want projectile
}
Coin.prototype.type = 'coin';
//Player.prototype.type = //needs a type or else non of the functions will work.

/////////me
function Meteor(pos, ch) {
  this.pos = pos;
  this.size = new Vector(0.5, 2);
  //this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
//  this.size = new Vector(0.7, 2.5);
  this.speed = new Vector(0, 5);
  //this.wobble = Math.random() * Math.PI * 2;
  //this.wobble = Math.random() / 2;
  this.repeatPos = pos;
}
Meteor.prototype.type = "Meteor";

///////////////////////////
// Lava is initialized based on the character, but otherwise has a
// size and position
/*function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    // Horizontal lava
    this.speed = new Vector(2, 0);
  } else if (ch == "|") {
    // Vertical lava
    this.speed = new Vector(0, 2);
  } else if (ch == "v") {
    // Drip lava. Repeat back to this pos.
    this.speed = new Vector(0, 3);
    this.repeatPos = pos;
  }
}
Lava.prototype.type = "lava";*/
///

function Vector(x, y) {
  this.x = x; this.y = y;
}

// Vector arithmetic: v_1 + v_2 = <a,b>+<c,d> = <a+c,b+d>
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

// Vector arithmetic: v_1 * factor = <a,b>*factor = <a*factor,b*factor>
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};


// A Player has a size, speed and position.
function Player(pos) {

  this.pos = pos.plus(new Vector(0, -0.5));
  //this.size = new Vector(0.8, 1.5);
  this.size = new Vector(1.0, 1.0);
  this.speed = new Vector(0, 0);
}
Player.prototype.type = "player";


// Helper function to easily create an element of a type provided
// and assign it a class.
function elt(name, className) {
  var elt = document.createElement(name);
  if (className) elt.className = className;
  return elt;
}

// Main display class. We keep track of the scroll window using it.
function DOMDisplay(parent, level) {

// this.wrap corresponds to a div created with class of "game"
  this.wrap = parent.appendChild(elt("div", "game"));
  this.level = level;

  // In this version, we only have a static background.
  this.wrap.appendChild(this.drawBackground());

  // Keep track of actors
  this.actorLayer = null;

  // Update the world based on player position
  this.drawFrame();
}

var scale = 20;

DOMDisplay.prototype.drawBackground = function() {
  var table = elt("table", "background");
  table.style.width = this.level.width * scale + "px";

  // Assign a class to new row element directly from the string from
  // each tile in grid
  this.level.grid.forEach(function(row) {
    var rowElt = table.appendChild(elt("tr"));
    rowElt.style.height = scale + "px";
    row.forEach(function(type) {
      rowElt.appendChild(elt("td", type));
    });
  });
  return table;
};

// Draw the player agent //draw actors instead
//DOMDisplay.prototype.drawPlayer = function() {
DOMDisplay.prototype.drawActors = function() {
  // Create a new container div for actor dom elements
  var wrap = elt("div");

  //var actor = this.level.player;
  //instead go through each actor
  this.level.actors.forEach(function(actor){

  var rect = wrap.appendChild(elt("div", "actor " + actor.type));

    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};

DOMDisplay.prototype.drawFrame = function() {
  if (this.actorLayer)
    this.wrap.removeChild(this.actorLayer);
  //this.actorLayer = this.wrap.appendChild(this.drawPlayer());
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  //////////////////////??????????????
  this.wrap.className = "game " + (this.level.status || "");
  ///////////////////////
  this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
  var width = this.wrap.clientWidth;
  var height = this.wrap.clientHeight;

  // We want to keep player at least 1/3 away from side of screen
  var margin = width / 3;

  // The viewport
  var left = this.wrap.scrollLeft, right = left + width;
  var top = this.wrap.scrollTop, bottom = top + height;

  var player = this.level.player;
  // Change coordinates from the source to our scaled.
  var center = player.pos.plus(player.size.times(0.5))
                 .times(scale);

  if (center.x < left + margin)
    this.wrap.scrollLeft = center.x - margin;
  else if (center.x > right - margin)
    this.wrap.scrollLeft = center.x + margin - width;
  if (center.y < top + margin)
    this.wrap.scrollTop = center.y - margin;
  else if (center.y > bottom - margin)
    this.wrap.scrollTop = center.y + margin - height;
};

//////////////////////////////////////
// Remove the wrap element when clearing the display
// This will be garbage collected
DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};
///////////////////////////////////

//checks obstacle relative to where the player is
Level.prototype.obstacleAt = function(pos, size){
    var xStart = Math.floor(pos.x);//where are x position? coordinate of x postion
    var xEnd = Math.ceil(pos.x + size.x);//x ending point. highest value. useful bc we arent sure what object we are using to move. ceil does int value
    var yStart = Math.floor(pos.y);//lowest value
    var yEnd = (Math.ceil(pos.y + size.y));//ending val is the ceiling so the highest

    if (xStart < 0 || xEnd > this.width || yStart < 0 || yEnd > this.height) //everything outside game level is a wall
      return 'wall';
      //if (yEnd > this.height)
      //return "lava";

      for (var y = yStart; y < yEnd; y++){
        for (var x = xStart; x < xEnd; x++){
            var fieldType = this.grid[y][x];//y comes first bc we check which row then check
            if(fieldType){
              //console.log(fieldType);
              return fieldType;

            }
        }
      }
};

Level.prototype.actorAt = function(actor) {
  for (var i=0; i<this.actors.length; i++) {
      var other = this.actors[i];
      if (other != actor &&
          actor.pos.x + actor.size.x > other.pos.x &&
          actor.pos.x< other.pos.x + other.size.x &&
          actor.pos.y + actor.size.y > other.pos.y &&
          actor.pos.y < other.pos.y + other.size.y)
          return other;
  }
};
// Update simulation each step based on keys & step size
Level.prototype.animate = function(step, keys) {
  ////////////////////////////////////////////////////////////////////
  if (this.status != null)
  this.finishDelay -= step;
  ///////////////////////////////////////////////////////////
  // Ensure each is maximum 100 milliseconds
  while (step > 0) {
    var thisStep = Math.min(step, maxStep);
      this.actors.forEach(function(actor) {
      //this.player.act(thisStep, this, keys);
      actor.act(thisStep, this, keys);
    }, this);
   // Do this by looping across the step size, subtracing either the
   // step itself or 100 milliseconds
    step -= thisStep;
  }
};

var wobbleSpeed = 3;
var wobbleDist = 0.5;

Coin.prototype.act = function(step) {
  this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));

};

/////also prototype
Meteor.prototype.act = function(step, level) {
  //var wobbleDist = 4.07;
  //var wobbleSpeed = 2;
  //this.wobble += step * wobbleSpeed;
//  var wobblePos = Math.cos(this.wobble) * wobbleDist;
  //this.pos = this.basePos.plus(new Vector(0, wobblePos));
var newPos = this.pos.plus(this.speed.times(step));
if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
    else if (this.repeatPos)
      this.pos = this.repeatPos;
    else
      this.speed = this.speed.times(-1);

};


/////////////////
/*Meteor.prototype.act = function(step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
    this.pos = this.repeatPos;*/
  /*else if (this.repeatPos)
    this.pos = this.repeatPos;
  else
    this.speed = this.speed.times(-1);
};/*
///////////////////////////////

var maxStep = 0.05;

var playerXSpeed = 8;

Player.prototype.moveX = function(step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= playerXSpeed;
  if (keys.right) this.speed.x += playerXSpeed;

  var motion = new Vector(this.speed.x * step, 0);
  // Find out where the player character will be in this frame
  var newPos = this.pos.plus(motion);

  //////////
  var obstacle = level.obstacleAt(newPos, this.size);

  if (obstacle)
  level.playerTouched(obstacle);
else
  // Move if there's not an obstacle there.
  this.pos = newPos;
};
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle != "wall")
  this.pos = newPos;
};*/
var maxStep = 0.05;

var playerXSpeed = 8;
/////////////////////////////////////////////
Player.prototype.moveX = function(step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= playerXSpeed;
  if (keys.right) this.speed.x += playerXSpeed;

  var motion = new Vector(this.speed.x * step, 0);
  // Find out where the player character will be in this frame
  var newPos = this.pos.plus(motion);
  // Find if there's an obstacle there
  var obstacle = level.obstacleAt(newPos, this.size);
  // Handle lava by calling playerTouched
  if (obstacle)
    level.playerTouched(obstacle);
  else
    // Move if there's not an obstacle there.
    this.pos = newPos;
};
////////////////////////////////////////////////

var gravity = 30;
var jumpSpeed = 15;
var playerYSpeed = 10;

Player.prototype.moveY = function(step, level, keys) {
  this.speed.y += step * gravity;//instead of 0 we want to constantly have gravity
  var motion = new Vector(0, this.speed.y * step); //still need motion
  var newPos = this.pos.plus(motion);//still need position
  //now check for falling until hits wall or ground
  var obstacle = level.obstacleAt(newPos, this.size);  //check for obstacle
////////////

  //var hitslava = level.obstacleAt(newPos, this.size);  //check for obstacle

  //if (obstacle){
    /////////////
    //console.log(gravity);
    /*if (obstacle == "floater")
      gravity = 200;
      console.log(gravity);
    if (obstacle == "floater" && gravity == 200)
      console.log(gravity);
      gravity = 40;*/

    /////////////////////////////
    /*if (obstacle) {
    level.playerTouched(obstacle);*/
    //////////////////////////////
    if (obstacle) {

      if (obstacle == "floater")
        jumpSpeed += 0.25;
        console.log(jumpSpeed);

        if (obstacle == "floater" && jumpSpeed >= 25)
          jumpSpeed = 15;
          console.log(jumpSpeed);

      level.playerTouched(obstacle);
    ////////////
    if (keys.up && this.speed.y >0)// th seconf part makes it so you cant double jump
    // this.speed.y -= playerYSpeed;
    this.speed.y = -jumpSpeed; // set player to negative jump speed.
  //  if (keys.down) this.speed.y += playerYSpeed;  no need for down key bc gravity
    else  // else if?
      this.speed.y = 0; //we dont want them to fall through the ground.
    } else {
      this.pos = newPos;
    }
};




Player.prototype.act = function(step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  var otherActor = level.actorAt(this);
  if (otherActor)
  level.playerTouched(otherActor.type, otherActor);

//////////////////////////////
// Losing animation
  if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
    this.size.y = 0.9;
    this.size.x = 0.9;

  }
//////////////////////////////////

};

Level.prototype.playerTouched = function(type, actor) {

/*  if (type == 'coin' || type == 'Something'){
    this.actors = this.actors.filter(function(other) {
      return other != actor;
    });*/////////////////////////////
    ///////////////////////////////////////
    // if the player touches lava and the player hasn't won
// Player loses
if (type == "lava" && this.status == null) {
  this.status = "lost";
  this.finishDelay = 1;
} else if (type == "Meteor" && this.status == null) {
    this.status = "lost";
    this.finishDelay = 0.5;


} else if (type == "coin") {
  this.actors = this.actors.filter(function(other) {
    return other != actor;
  });
    ////////////////////////////////////////////
    // If there aren't any coins left, player wins
  if (!this.actors.some(function(actor) {
         return actor.type == "coin";
       })) {
    this.status = "won";
    this.finishDelay = 1;
    }
    ////////////////////////////////////////////
  }
};



// Arrow key codes for readability
var arrowCodes = {37: "left", 38: "up", 39: "right", 40: "down"};

// Translate the codes pressed from a key event
function trackKeys(codes) {
  var pressed = Object.create(null);

  // alters the current "pressed" array which is returned from this function.
  // The "pressed" variable persists even after this function terminates
  // That is why we needed to assign it using "Object.create()" as
  // otherwise it would be garbage collected

  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      // If the event is keydown, set down to true. Else set to false.
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      // We don't want the key press to scroll the browser window,
      // This stops the event from continuing to be processed
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

// frameFunc is a function called each frame with the parameter "step"
// step is the amount of time since the last call used for animation
function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
      // Set a maximum frame step of 100 milliseconds to prevent
      // having big jumps
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// This assigns the array that will be updated anytime the player
// presses an arrow key. We can access it from anywhere.
var arrows = trackKeys(arrowCodes);
/*
// Organize a single level and begin animation
function runLevel(level, Display) {
  var display = new Display(document.body, level);

  runAnimation(function(step) {
    // Allow the viewer to scroll the level
    level.animate(step, arrows);
    display.drawFrame(step);
  });
}*/
// Organize a single level and begin animation
function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);

  runAnimation(function(step) {
    // Allow the viewer to scroll the level
    level.animate(step, arrows);
    display.drawFrame(step);
    if (level.isFinished()) {
      display.clear();
      if (andThen)
        andThen(level.status);
      return false;
    }
  });
}



function runGame(plans, Display) {
  function startLevel(n) {
    // Create a new level using the nth element of array plans
    // Pass in a reference to Display function, DOMDisplay (in index.html).
    //runLevel(new Level(plans[n]), Display);
    runLevel(new Level(plans[n]), Display, function(status) {
    ///////////////////////////////////

    if (status == "lost")
        startLevel(n);
      else if (n < plans.length - 1)
        startLevel(n + 1);
      else
       alert("CONGRATULATIONS! YOUVE BEAT LAVA RUINS!!!");
    });

    //////
  }
  startLevel(0);
}
