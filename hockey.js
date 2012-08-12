/** iPod air hockey (EXPERIMENTAL) ***********************************/

// shim layer with setTimeout fallback
// from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
    };
})();

var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

var malletRadius = 30;
var puckRadius = malletRadius / 2;
var mouseDown = false;
var mouseX, mouseY;
var mouseId = "mouse";

var PUCK = "puck";
var MALLET = "mallet";

// keys are touch identifiers (or mouseId)
// values are circle objects
var circlesBeingMoved = {};

var dampeningFactor = 0.995;

var circles = [
  {
    type: PUCK,
    x: centerX,
    y: centerY,
    radius: puckRadius,
    velocity: {x:0, y:0}
  },
  {
    type: MALLET,
    x: centerX,
    y: canvas.height - malletRadius*1.5,
    radius: malletRadius,
    velocity: {x:0, y:0}
  },
  {
    type: MALLET,
    x: centerX,
    y: malletRadius*1.5,
    radius: malletRadius,
    velocity: {x:0, y:0}
  }
];

function executeFrame(){
  requestAnimFrame(executeFrame);
  iterateSimulation();
  
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  
  c.fillStyle = "black";
  var i, circle;
  for(i = 0; i < circles.length; i++){
    drawCircle(circles[i]);
  }
}

function iterateSimulation(){
  var circle;
  for(var id in circlesBeingMoved){
    circle = circlesBeingMoved[id];
    circle.velocity.x = 0;
    circle.velocity.y = 0;
  }
  
  for(i = 0; i < circles.length; i++){
    circle = circles[i];
    
    // slows things down
    circle.velocity.x *= dampeningFactor;
    circle.velocity.y *= dampeningFactor;
    
    // Add velocity to position (puck only)
    if(circle.type == PUCK){
      circle.x += circle.velocity.x;
      circle.y += circle.velocity.y;
      
      // PUCK: bounce off boundaries
      /*if(circle.y > canvas.height - (malletRadius*3+circle.radius)){
        circle.y = canvas.height - (malletRadius*3+circle.radius);
        circle.velocity.y = - Math.abs(circle.velocity.y);
      } // bounce off ceiling
      if(circle.y < circle.radius+malletRadius*3){
        circle.y = circle.radius+malletRadius*3;
        circle.velocity.y = Math.abs(circle.velocity.y);
      }*/
      // bounce off right wall
      if(circle.x > canvas.width - (puckRadius*3 + circle.radius)){
        circle.x = canvas.width - (puckRadius*3 + circle.radius);
        circle.velocity.x = -Math.abs(circle.velocity.x);
      } // bounce off left wall
      if(circle.x < puckRadius*3 + circle.radius){
        circle.x = puckRadius*3 + circle.radius;
        circle.velocity.x = Math.abs(circle.velocity.x);
      }
    }
    
    // MALLETS: bounce off the floor
    if(circle.y > canvas.height - circle.radius){
      circle.y = canvas.height - circle.radius;
      circle.velocity.y = - Math.abs(circle.velocity.y);
    } // bounce off ceiling
    if(circle.y < circle.radius){
      circle.y = circle.radius;
      circle.velocity.y = Math.abs(circle.velocity.y);
    } // bounce off right wall
    if(circle.x > canvas.width - circle.radius){
      circle.x = canvas.width - circle.radius;
      circle.velocity.x = -Math.abs(circle.velocity.x);
    } // bounce off left wall
    if(circle.x < circle.radius){
      circle.x = circle.radius;
      circle.velocity.x = Math.abs(circle.velocity.x);
    }      
    
    // REPULSION between circles
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

function drawCircle(circle){
  // draw circle
  c.beginPath();
  c.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
  c.fill();
}

function drawBoard(){
  // draw border
  c.lineWidth = 5;
  c.strokeRect(0,0,canvas.width,canvas.height);
  
  // draw goals: bottom
  c.beginPath();
  c.moveTo(0, canvas.height - malletRadius*3);
  c.lineTo(canvas.width, canvas.height - malletRadius*3);
  c.stroke();
  
  // draw goals: top
  c.beginPath();
  c.moveTo(0, malletRadius*3);
  c.lineTo(canvas.width, malletRadius*3);
  c.stroke();
  
  // draw sidelines: left
  c.beginPath();
  c.moveTo(puckRadius*3, malletRadius*3);
  c.lineTo(puckRadius*3, canvas.height - malletRadius*3);
  c.stroke();
  
  // draw sidelines: right
  c.beginPath();
  c.moveTo(canvas.width - puckRadius*3, malletRadius*3);
  c.lineTo(canvas.width - puckRadius*3, canvas.height - malletRadius*3);
  c.stroke();
  
  // draw center line
  c.beginPath();
  c.moveTo(canvas.width - puckRadius*3, centerY);
  c.lineTo(puckRadius*3, centerY);
  c.stroke();
}

function addMouseListeners(){
  canvas.addEventListener("mousedown", function(e){
    var circleUnderMouse = getCircleUnderPoint(e.clientX, e.clientY);
    if(circleUnderMouse && circleUnderMouse.type == MALLET)
      circlesBeingMoved[mouseId] = circleUnderMouse;
    mouseDown = true;
  });
  
  canvas.addEventListener("mouseup", function(e){
    mouseDown = false;
    if(circlesBeingMoved[mouseId])
      delete circlesBeingMoved[mouseId];
  });
  
  canvas.addEventListener("mouseout", function(e){
    mouseDown = false;
  });
  
  canvas.addEventListener("mousemove", function(e){
    mouseX = e.clientX;
    mouseY = e.clientY;
    var circleUnderMouse = circlesBeingMoved[mouseId];  
    if(circleUnderMouse){
      circleUnderMouse.x = mouseX;
      circleUnderMouse.y = mouseY;
    }
  });
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

function addMultiTouchListeners(){
  canvas.addEventListener('touchstart',function(e){
    if(e.changedTouches.length > 0){
      var touch = e.changedTouches[0];
      
      var circleUnderTouch = getCircleUnderPoint(touch.pageX, touch.pageY);
      if(circleUnderTouch && circleUnderTouch.type == MALLET)
        circlesBeingMoved[touch.identifier] = circleUnderTouch;
    }
  });
  
  canvas.addEventListener('touchmove',function(e){
    if(e.changedTouches.length > 0){
      var touch = e.changedTouches[0];
      var circleUnderTouch = circlesBeingMoved[touch.identifier];
      if(circleUnderTouch){
        circleUnderTouch.x = touch.pageX;
        circleUnderTouch.y = touch.pageY;
      }
    }
  });
  
  canvas.addEventListener('touchend',function(e){
    if(e.changedTouches.length > 0){
      var touch = e.changedTouches[0];
      if(circlesBeingMoved[touch.identifier])
        delete circlesBeingMoved[touch.identifier];
    }
  });
}

addMultiTouchListeners();
addMouseListeners();

// disable scrolling in iOS
document.body.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, false);

// start animation
executeFrame();