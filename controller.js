function scoring(){
  if(didP1Score || didP2Score){
    // reset puck position
    resetPuck();
  }
  
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

function resetPuck(){
  // return puck to original position
  circles[0] = {
      type: PUCK,
      totalPucks: "totalPucks--",
      x: centerX,
      y: centerY,
      radius: puckRadius,
      color: "363636",
      velocity: {x:0, y:0}
    };
  
  // reset scores
  //p1Score = 0, p2Score = 0;
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

// disable scrolling in iOS
document.body.addEventListener('touchmove', function(e) {
e.preventDefault();
}, false);