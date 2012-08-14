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