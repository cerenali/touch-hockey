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