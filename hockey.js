/** iPod air hockey (EXPERIMENTAL) ***********************************/

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