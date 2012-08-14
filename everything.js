/** iPod air hockey (EXPERIMENTAL) ***********************************/
///////////////////////////////////
var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function drawScores(){
  c.font = "bold 28px sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  
  c.fillStyle = "363636";
  c.fillText(+p1Score, canvas.width - puckRadius*1.5, malletRadius*4);
  c.fillText(+p2Score, canvas.width-puckRadius*1.5, canvas.height - malletRadius*4);
}

function drawCircle(circle){
  // draw circle
  c.beginPath();
  c.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
  if(circle.type == MALLET){
    c.strokeStyle="363636";
    c.stroke();
  }
  else{
    c.strokeStyle="white";
    c.stroke();
  }
  c.fillStyle = circle.color;
  c.fill();
}

function drawBoard(){
  c.strokeStyle = "black";
  c.lineWidth = 2;
  
  // draw border
  c.strokeRect(0,0,canvas.width,canvas.height);
  
  // draw goals: bottom
  c.beginPath();
  c.moveTo(goalLeft, canvas.height);
  c.lineTo(goalLeft, canvas.height - goalHeight);
  c.lineTo(goalRight, canvas.height - goalHeight);
  c.lineTo(goalRight, canvas.height);
  c.stroke();
  c.closePath();
  
  // draw goals: top
  c.beginPath();
  c.moveTo(goalLeft, 0);
  c.lineTo(goalLeft, goalHeight);
  c.lineTo(goalRight, goalHeight);
  c.lineTo(goalRight, 0);
  c.stroke();
  c.closePath();
  
  // draw sidelines: left
  c.beginPath();
  c.moveTo(puckRadius*3, 0);
  c.lineTo(puckRadius*3, canvas.height);
  c.stroke();
  c.closePath();
  
  // draw sidelines: right
  c.beginPath();
  c.moveTo(canvas.width - puckRadius*3, 0);
  c.lineTo(canvas.width - puckRadius*3, canvas.height);
  c.stroke();
  c.closePath();
  
  // draw center line
  c.beginPath();
  c.moveTo(canvas.width - puckRadius*3, centerY);
  c.lineTo(puckRadius*3, centerY);
  c.stroke();
  c.closePath();
}
///////////////////////////////////
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

var malletRadius = 60;
var puckRadius = malletRadius / 2;
var goalLeft = centerX/2;
var goalRight = centerX*3/2;
var goalHeight = malletRadius/5;
var sidelineWidth = puckRadius*3;

var mouseId = "mouse";

var PUCK = "puck";
var MALLET = "mallet";
var ONE = "player1";
var TWO = "player2";

// keys are touch identifiers (or mouseId)
// values are circle objects
var circlesBeingMoved = {};

var dampeningFactor = 0.995;

var usedPucks, unusedPucks;
var didP1Score = false, didP2Score = false;
var p1Score = 0, p2Score = 0;

var circles = [
  {
    type: PUCK,
    totalPucks: 8,
    x: centerX,
    y: centerY,
    radius: puckRadius,
    color: "363636",
    velocity: {x:0, y:0}
  },
  {
    type: MALLET,
    player: ONE,
    x: centerX,
    y: malletRadius*1.5,
    radius: malletRadius,
    color: "E0173F",
    velocity: {x:0, y:0}
  },
  {
    type: MALLET,
    player: TWO,
    x: centerX,
    y: canvas.height - malletRadius*1.5,
    radius: malletRadius,
    color: "1A5D9C",
    velocity: {x:0, y:0}
  }
];

function iterateSimulation(){
  var circle;
  var xLeft = sidelineWidth;
  var xRight = canvas.width - sidelineWidth;
  
  for(i = 0; i < circles.length; i++){
    circle = circles[i];
    
    // Add velocity to position (puck only)
    if(circle.type == PUCK){
      
      // if the circle is inside a goal, reset it to the center and note who scored
      if(behindTopGoal(circle)){
          didP2Score = true;
          resetPuck();
      }
      else if(behindBottomGoal(circle)){
          didP1Score = true;
          resetPuck();
      }
      
      // slows things down
      circle.velocity.x *= dampeningFactor;
      circle.velocity.y *= dampeningFactor;
      circle.x += circle.velocity.x;
      circle.y += circle.velocity.y;
      
      // floor
      if(circle.y > canvas.height - circle.radius && isNotInGoal(circle)){
        circle.y = canvas.height - circle.radius;
        circle.velocity.y = -Math.abs(circle.velocity.y);
      } // ceiling
      if(circle.y < circle.radius && isNotInGoal(circle)){
        circle.y = circle.radius;
        circle.velocity.y = Math.abs(circle.velocity.y);
      }
    }
    
    // boundaries
    // floor
    if(circle.y > canvas.height - circle.radius && circle.type == MALLET){
      circle.y = canvas.height - circle.radius;
      //circle.velocity.y = -Math.abs(circle.velocity.y);
    } // ceiling
    if(circle.y < circle.radius && circle.type == MALLET){
      circle.y = circle.radius;
      //circle.velocity.y = Math.abs(circle.velocity.y);
    }
    // bounce off right wall
    if(circle.x > xRight - circle.radius){
      circle.x = xRight - circle.radius;
      circle.velocity.x = -Math.abs(circle.velocity.x);
    } // bounce off left wall
    if(circle.x < xLeft + circle.radius){
      circle.x = xLeft + circle.radius;
      circle.velocity.x = Math.abs(circle.velocity.x);
    }// right sideline (velocity for puck)
    if(circle.x > xRight - circle.radius){
        circle.x = xRight - circle.radius;
        circle.velocity.x = -Math.abs(circle.velocity.x);
    } // left sideline
    if(circle.x < xLeft + circle.radius){
        circle.x = xLeft + circle.radius;
        circle.velocity.x = Math.abs(circle.velocity.x);
    }
    // centerline
    if(circle.player == ONE){
      if(circle.y > centerY - circle.radius){
        circle.y = centerY - circle.radius;
      }
    }else if (circle.player == TWO){
      if(circle.y < centerY + circle.radius){
        circle.y = centerY + circle.radius;
      }
    }
    
    // REPULSION between circles
    var circle2, j, i;
    for(j = i + 1; j < circles.length; j++){
      circle2 = circles[j];
      var dx = circle2.x - circle.x;
      var dy = circle2.y - circle.y;
      var d = Math.sqrt(dx*dx + dy*dy);
      
      if(d < circle.radius + circle2.radius){
        if(d === 0){
          d = 0.1;
        }
        var unitX = dx/d;
        var unitY = dy/d;
        
        var force = -2;
        
        var forceX = unitX * force;
        var forceY = unitY * force;
        
        circle.velocity.x += forceX;
        circle.velocity.y += forceY;
        
        circle2.velocity.x -= forceX;
        circle2.velocity.y -= forceY;
      }
    }
  }
}
///////////////////////////////////////////////
function behindTopGoal(circle){
  var behindTopGoal = circle.y < -circle.radius;
  return behindTopGoal;
}

function behindBottomGoal(circle){
  var behindBottomGoal = circle.y > canvas.height + circle.radius;
  return behindBottomGoal;
}

function isNotInGoal(circle){
    if(circle.type == PUCK){
      var inGoalLeft = circle.x - circle.radius > centerX - goalLeft;
      var inGoalRight = circle.x + circle.radius < centerX + goalLeft;
      var isInGoal = inGoalLeft && inGoalRight;
      return !isInGoal;
    }
}

function scoring(){
  /*if(didP1Score || didP2Score){
    // reset puck position
    resetPuck();
  }*/
  
  if(didP1Score){
    p1Score++;
    didP1Score = false;
  }
  else if(didP2Score){
    p2Score++;
    didP2Score = false;
  }
}

function getCircleUnderPoint(x, y){
  var i, circle, dx, dy, distance;
  for(i = 0; i < circles.length; i++){
    circle = circles[i];
    dx = circle.x - x;
    dy = circle.y - y;
    distance = Math.sqrt(dx*dx + dy*dy);
    
    if(distance < circle.radius)
      return circle;
  }
  return undefined;
}

/*function isBehindGoal(circle){
  var behindTopGoal = circle.y < -circle.radius;
  var behindBottomGoal = circle.y > canvas.width + circle.radius;
  return behindTopGoal || behindBottomGoal;
}*/

function resetPuck(){
  // return puck *AND MALLETS* to original position
  circles = [
    {
      type: PUCK,
      totalPucks: 8,
      x: centerX,
      y: centerY,
      radius: puckRadius,
      color: "363636",
      velocity: {x:0, y:0}
    },
    {
      type: MALLET,
      player: ONE,
      x: centerX,
      y: malletRadius*1.5,
      radius: malletRadius,
      color: "E0173F",
      velocity: {x:0, y:0}
    },
    {
      type: MALLET,
      player: TWO,
      x: centerX,
      y: canvas.height - malletRadius*1.5,
      radius: malletRadius,
      color: "1A5D9C",
      velocity: {x:0, y:0}
    }
  ];
}

function restart(){
  circles = [
    {
      type: PUCK,
      totalPucks: 8,
      x: centerX,
      y: centerY,
      radius: puckRadius,
      color: "363636",
      velocity: {x:0, y:0}
    },
    {
      type: MALLET,
      player: ONE,
      x: centerX,
      y: malletRadius*1.5,
      radius: malletRadius,
      color: "E0173F",
      velocity: {x:0, y:0}
    },
    {
      type: MALLET,
      player: TWO,
      x: centerX,
      y: canvas.height - malletRadius*1.5,
      radius: malletRadius,
      color: "1A5D9C",
      velocity: {x:0, y:0}
    }
  ];
  
  p1Score = 0, p2Score = 0;
}

// user interaction (mouse & touch)
function pointDown(x, y, id){
  var circleUnderPoint = getCircleUnderPoint(x, y);
  if(circleUnderPoint && circleUnderPoint.type == MALLET)
    circlesBeingMoved[id] = circleUnderPoint;
}
function pointUp(id){
  if(circlesBeingMoved[id])
    delete circlesBeingMoved[id];
}

function pointMove(x, y, id){
  var circle = circlesBeingMoved[id];
  if(circle){
    circle.x = x;
    circle.y = y;
    
    // prevent weird invisible mallet bug
    // ensure mallets are on correct side
    /*if(circle.type == MALLET){
      if(circle.player == ONE){
        if(circle.y > centerY - circle.radius)
          circle.y = centerY - circle.radius;
      }
      else if (circle.player == TWO){
        if(circle.y < centerY + circle.radius)
          circle.y = centerY + circle.radius;
      }*/
    }
}
///
canvas.addEventListener("mousedown", function(e){
  pointDown(e.clientX, e.clientY, mouseId);
});
canvas.addEventListener('touchstart',function(e){
  var i;
  for(i = 0; i < e.changedTouches.length; i++){
    var touch = e.changedTouches[i];
    pointDown(touch.pageX, touch.pageY, touch.identifier);
  }
});

canvas.addEventListener("mouseup", function(e){
  pointUp(mouseId);
});
canvas.addEventListener("mouseout", function(e){
  pointUp(mouseId);
});
canvas.addEventListener('touchend',function(e){
  var i;
  for(i = 0; i < e.changedTouches.length; i++){
    var touch = e.changedTouches[i];
    pointUp(touch.identifier);
  }
});

canvas.addEventListener("mousemove", function(e){
  pointMove(e.clientX, e.clientY, mouseId);
});
canvas.addEventListener('touchmove',function(e){
  var i;
  for(i = 0; i < e.changedTouches.length; i++){
    var touch = e.changedTouches[i];
    pointMove(touch.pageX, touch.pageY, touch.identifier);
  }
  
  // prevent default scrolling in iOS
  e.preventDefault();
});
////////////////////////////////////////

function executeFrame(){
  requestAnimFrame(executeFrame);
  iterateSimulation();
  
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  scoring();
  drawScores();
  
  var i;
  for(i = 0; i < circles.length; i++){
    drawCircle(circles[i]);
  }
}

// start animation
executeFrame();