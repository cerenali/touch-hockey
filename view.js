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
  c.strokeStyle = "363636";
  
  // draw border
  c.lineWidth = 5;
  c.strokeRect(0,0,canvas.width,canvas.height);
  
  // draw goals: bottom
  c.beginPath();
  c.moveTo(0, canvas.height - malletRadius*3);
  c.lineTo(canvas.width, canvas.height - malletRadius*3);
  c.stroke();
  c.closePath();
  
  // draw goals: top
  c.beginPath();
  c.moveTo(0, malletRadius*3);
  c.lineTo(canvas.width, malletRadius*3);
  c.stroke();
  c.closePath();
  
  // draw sidelines: left
  c.beginPath();
  c.moveTo(puckRadius*3, malletRadius*3);
  c.lineTo(puckRadius*3, canvas.height - malletRadius*3);
  c.stroke();
  c.closePath();
  
  // draw sidelines: right
  c.beginPath();
  c.moveTo(canvas.width - puckRadius*3, malletRadius*3);
  c.lineTo(canvas.width - puckRadius*3, canvas.height - malletRadius*3);
  c.stroke();
  c.closePath();
  
  // draw center line
  c.beginPath();
  c.moveTo(canvas.width - puckRadius*3, centerY);
  c.lineTo(puckRadius*3, centerY);
  c.stroke();
  c.closePath();
}