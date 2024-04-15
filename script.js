/*
Added a color gradient inspired by 
https://codepen.io/taylorvowell/pen/BkxbC
--via--
https://codepen.io/tmrDevelops/pen/YXNqOj
*/

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

window.onresize = function() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

var idCounter = 0, clickCounter = 0, hitCounter = 0;

function Box (x, y, size) {
  this.myID = idCounter;
  idCounter++;
  this.size = size || 100;
  this.x = x || Math.random() * (innerWidth - this.size);
  this.y = y || Math.random() * (innerHeight - this.size);
  this.ptx = Math.random() * (innerWidth - this.size);
  this.pty = Math.random() * (innerHeight - this.size);
  this.r = Math.round(Math.random() * 200) + 55;
  this.g = Math.round(Math.random() * 200) + 55;
  this.b = 255;
  this.strokeWidth = this.size * 0.2;
  this.speed = 100 / this.size;
  this.bbox = {};
  
  this.pickNewPoint = function() {
    if (Math.random() < 0.5) {
      this.ptx = Math.random() * (innerWidth - this.size);
    } else {
      this.pty = Math.random() * (innerHeight - this.size);
    }
  };
  
  this.moveToPoint = function() {
    if (this.x == this.ptx && this.y == this.pty) {
      this.pickNewPoint();
    }
    if (Math.abs(this.x - this.ptx) <= this.speed) {
      this.x = this.ptx;
    } else {
      this.x > this.ptx ? this.x -= this.speed : this.x += this.speed; 
    }
    if (Math.abs(this.y  - this.pty) <= this.speed) {
      this.y = this.pty;
    } else {
      this.y > this.pty ? this.y -= this.speed : this.y += this.speed;
    }
    this.updateBBox();
  };
  
  this.updateBBox = function() {
    this.bbox.left = this.x - this.strokeWidth;
    this.bbox.right = this.x + this.size + this.strokeWidth;
    this.bbox.top = this.y - this.strokeWidth;
    this.bbox.bottom = this.y + this.size + this.strokeWidth;
  };
  
  this.splitMe = function(index) {
    var nextX = this.x;
    var nextY = this.y;
    if (this.size > 10) {
      boxArray.push(new Box(nextX, nextY, this.size - 10));
      boxArray.push(new Box(nextX, nextY, this.size - 10));
      boxArray.splice(index, 1);
    } else {
      this.speed = 1;
      this.r = 255;
      this.g = 168;
      this.b = 168;
    }
  };
}

var stats = document.getElementById('stats');
var updateStats = function(){
  stats.textContent = 'Clicks: ' + clickCounter + ' | Hits: ' + hitCounter + ' | Accuracy: ' + (Math.round((hitCounter / clickCounter) * 100) || '0') + '%';
}
updateStats();

var boxArray = [];
boxArray.push(new Box(null, null, 100));

var reset = document.getElementById('reset');
reset.addEventListener('click', function(){
  hitCounter = 0;
  clickCounter = 0;
  idCounter = 0;
  boxArray = [];
  boxArray.push(new Box(null, null, 100));
  updateStats();
})

document.addEventListener('mousedown',function(e){
  e.preventDefault();
  for (var i = 0; i < boxArray.length; i++) {
    if (e.clientX >= boxArray[i].bbox.left && 
        e.clientX <= boxArray[i].bbox.right && 
        e.clientY >= boxArray[i].bbox.top && 
        e.clientY <= boxArray[i].bbox.bottom) {
      boxArray[i].splitMe(i);
      hitCounter++;
    }
  }
  clickCounter++;
  updateStats();
})

var bgGrad = ctx.createLinearGradient(0, 0, innerWidth, innerHeight);
bgGrad.addColorStop(0,'rgb(48,12,36)');
bgGrad.addColorStop(0.5,'rgb(36,12,48)');
bgGrad.addColorStop(1,'rgb(8,16,26)');

function draw() {
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  for (var j = 0; j < boxArray.length; j++) {
    ctx.strokeStyle = 'rgb(' + boxArray[j].r + ',' + boxArray[j].g + ',' + boxArray[j].b +  ')';
    ctx.lineWidth = boxArray[j].strokeWidth;
    ctx.strokeRect(boxArray[j].x, boxArray[j].y, boxArray[j].size, boxArray[j].size);
    boxArray[j].moveToPoint();
  }
   window.requestAnimFrame = function(){
    return (
        window.requestAnimationFrame(draw)       || 
        window.webkitRequestAnimationFrame(draw) || 
        window.mozRequestAnimationFrame(draw)    || 
        window.oRequestAnimationFrame(draw)      || 
        window.msRequestAnimationFrame(draw)
    );
}();
}

draw();