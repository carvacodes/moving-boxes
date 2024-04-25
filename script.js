/*
Added a color gradient inspired by 
https://codepen.io/taylorvowell/pen/BkxbC
--via--
https://codepen.io/tmrDevelops/pen/YXNqOj
*/

  //////////////////////////////////////
 //      DOM Element Definitions     //
//////////////////////////////////////

// create canvas and context and set relevant variables

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

window.onresize = function() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

// GUI elements
let stats = document.getElementById('stats');
let resetButton = document.getElementById('reset');

// background gradient definition
let bgGrad = ctx.createLinearGradient(0, 0, innerWidth, innerHeight);
bgGrad.addColorStop(0,'rgb(53, 7, 83)');
bgGrad.addColorStop(0.5,'rgb(131, 7, 81)');
bgGrad.addColorStop(1,'rgb(107, 10, 110)');

  //////////////////////////////////////
 //       Global Game Variables      //
//////////////////////////////////////

let clickCounter = 0, hitCounter = 0, accuracy = 0, completeCount = 0;
let itemArray = [];

  //////////////////////////////////////
 //          Event Listeners         //
//////////////////////////////////////

resetButton.addEventListener('mousedown', resetHandler);
window.addEventListener('mousedown', itemInteractHandler);

resetButton.addEventListener('touchstart', resetHandler);
window.addEventListener('touchstart', itemInteractHandler, {passive: false});

  //////////////////////////////////////
 //     Event Handler Functions      //
//////////////////////////////////////

// handle clicks of the reset button
function resetHandler() {
  hitCounter = 0;
  clickCounter = 0;
  completeCount = 0;
  itemArray = [];
  itemArray.push(new Item(null, null, 100));
  updateStats();
}

// handle the user interacting with an item
function itemInteractHandler(e) {
  if (e.changedTouches) {
    e.preventDefault();
    e = e.touches[0];
  }
  let clickedCompleted = false;

  // don't penalize the player for clicking the reset button
  if (e.target.id == 'reset') {
    return;
  }

  for (let i = 0; i < itemArray.length; i++) {
    let item = itemArray[i];

    // if you clicked within an item's bounding box
    if (e.clientX >= item.bbox.left && 
        e.clientX <= item.bbox.right && 
        e.clientY >= item.bbox.top && 
        e.clientY <= item.bbox.bottom) {
      // if the item is not complete, split it and add increment the hit counter
      if (!item.complete) {
        item.splitMe(i);
        hitCounter++;
      } else {
        // if the item is complete, decrement the hit counter (so that the player isn't penalized for clicking a completed item)
        clickedCompleted = true;
        item.flash();
      }
    }
  }

  if (!clickedCompleted) { clickCounter++; }
  updateStats();
}

  //////////////////////////////////////
 //    Draw and Animate Functions    //
//////////////////////////////////////

let currentTime = Date.now();

function draw() {
  let frameTime = Date.now();

  // lock to 60 fps; if fewer than 16 ms have passed, requestAnimationFrame again with no updates; otherwise, do all updates;
  if (frameTime - currentTime < 16) {
    window.requestAnimationFrame(draw);
    return;
  } else {
    currentTime = frameTime;

    // draw the background
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    for (let j = 0; j < itemArray.length; j++) {
      let item = itemArray[j];

      // draw "non-complete" items with a rectangle
      if (!item.complete) {
        ctx.strokeStyle = 'rgb(' + item.r + ',' + item.g + ',' + item.b +  ')';
        ctx.lineWidth = item.strokeWidth;
        ctx.strokeRect(item.x, item.y, item.size, item.size);
      } else {
        // draw "complete" items as circles instead
        item.updateColor(); // update the gradient

        // draw
        ctx.fillStyle = 'rgb(' + item.r + ',' + item.g + ',' + item.b +  ')';
        ctx.beginPath();
        ctx.ellipse(item.x + item.size / 2, item.y + item.size / 2, item.size / 2, item.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // move the item
      item.moveToPoint();
    }

    window.requestAnimationFrame(draw);
  }
}

  //////////////////////////////////////
 //        GUI Update Function       //
//////////////////////////////////////

function updateStats(){
  clickToHitRatio = Math.round((hitCounter / clickCounter) * 100);
  let accuracyText = clickToHitRatio ? Math.min(100, clickToHitRatio) : 0;
  stats.textContent = 'Clicks: ' + clickCounter + ' | Hits: ' + hitCounter + ' | Complete: ' + completeCount + ' | Accuracy: ' + accuracyText + '%';
}

  //////////////////////////////////////
 //     Initialization Function      //
//////////////////////////////////////

function init() {
  resetHandler();

  draw();
}

  //////////////////////////////////////
 //       Prototype Definition       //
//////////////////////////////////////

class Item {
  constructor(x, y, size) {
    // set vars
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
    this.complete = false;

    // colorDirections indicate either decreasing (-1) or increasing (1) colors for completed items
    this.colorDirections = {
      r: 1,
      g: 1,
      b: 1
    };

    // randomly choose a new point to move to
    this.pickNewPoint = function () {
      // non-complete items: new point is locked to either a new X *or* a new Y position, but never both
      if (!this.complete) {
        if (Math.random() < 0.5) {
          this.ptx = Math.random() * (innerWidth - this.size);
        } else {
          this.pty = Math.random() * (innerHeight - this.size);
        }
      } else { // complete items can move diagonally; new point is not exclusive to one axis
        this.ptx = Math.random() * (innerWidth - this.size);
        this.pty = Math.random() * (innerHeight - this.size);
      }
    };

    this.moveToPoint = function () {
      if (this.x == this.ptx && this.y == this.pty) {
        this.pickNewPoint();
      }
      if (Math.abs(this.x - this.ptx) <= this.speed) {
        this.x = this.ptx;
      } else {
        this.x > this.ptx ? this.x -= this.speed : this.x += this.speed;
      }
      if (Math.abs(this.y - this.pty) <= this.speed) {
        this.y = this.pty;
      } else {
        this.y > this.pty ? this.y -= this.speed : this.y += this.speed;
      }
      this.updateBBox();
    };

    // update the bounding box coordinates
    this.updateBBox = function () {
      this.bbox.left = this.x - this.strokeWidth;
      this.bbox.right = this.x + this.size + this.strokeWidth;
      this.bbox.top = this.y - this.strokeWidth;
      this.bbox.bottom = this.y + this.size + this.strokeWidth;
    };

    this.splitMe = function (index) {
      if (this.size > 20) {
        let nextX = this.x;
        let nextY = this.y;
        itemArray.push(new Item(nextX, nextY, this.size - 10));
        itemArray.push(new Item(nextX, nextY, this.size - 10));
        itemArray.splice(index, 1);
      } else {
        this.speed = 1;
        this.complete = true;
        completeCount++;
      }
    };

    this.updateColor = function () {
      this.colorDirections.r *= this.r >= 255 || this.r <= 50 ? -1 : 1;
      this.colorDirections.g *= this.g >= 255 || this.g <= 50 ? -1 : 1;
      this.colorDirections.b *= this.b >= 255 || this.b <= 50 ? -1 : 1;

      this.r += this.colorDirections.r;
      this.g += this.colorDirections.g;
      this.b += this.colorDirections.b;
    };

    this.flash = function () {
      let rand = Math.random();
      if (rand <= 0.333) {
        this.r = 255;
        this.g = this.b = 52;
      } else if (rand > 0.333 && rand <= 0.667) {
        this.g = 255;
        this.r = this.b = 52;
      } else {
        this.b = 255;
        this.r = this.g = 52;
      }
    };
  }
}

  //////////////////////////////////////
 //          Initialization          //
//////////////////////////////////////

window.addEventListener('load', init);