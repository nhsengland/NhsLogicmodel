class drawer {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.ctxTxt = '2d';
    this.initialised = false;
    this.offsetDrawY = 0;
    this.connections = [];
    this.arrowStyles = [];
    this.drawingLineColor = '#0f62af';
    this.pressedX = 0;
    this.pressedY = 0;
    this.isPressed = false;
    this.count = 0;
    this.timer = null;
    this.arrowMode = 0;
  }

  init() {
    if (this.initialised) {
      return;
    }

    let _this = this;

    this.myCanvas = document.getElementById(this.canvasId);
    this.ctx = this.myCanvas.getContext(this.ctxTxt);
    this.ctx.clearRect(0, 0, this.myCanvas.width, this.myCanvas.height);
    this.ctx.imageSmoothingEnabled = true;
    this.imgData = this.ctx.getImageData(0, 0, 1920, 3000);
    this.initialised = true;


    window.onscroll = function () {
      _this.updateOffset();
    };

    window.onresize = function () {
      if (_this.timer !== null) {
        clearTimeout(_this.timer);
      }
      _this.timer = setTimeout(function () {
        _this.draw(_this.connections, _this.arrowStyles);
      }, 50);
    };

    if(document.querySelector('.main-column')) {
      let currentKahootzSize = document.querySelector('.main-column').offsetWidth;
      setInterval(function() {
        let activeKahootzSize = document.querySelector('.main-column').offsetWidth;
        if(activeKahootzSize != currentKahootzSize) {
          _this.draw(_this.connections, _this.arrowStyles);
          currentKahootzSize = activeKahootzSize;
        }
      }, 100);
    }
  }

  draw(connections, arrowStyles) {
    let _this = this;
    let offset = 8; // arrow not clash with box border
    let contraryStartOffset = 3;
    let contraryEndOffset = 10;

    this.connections = connections;
    this.arrowStyles = arrowStyles;

    this.ctx.clearRect(0, 0, this.myCanvas.width, this.myCanvas.height);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = _this.drawingLineColor;

    /* we parsing the connections */
    connections.forEach(function (e) {
      /* we getting the xy output and xy input from the id of the drag items */
      var output = _this.getPinPos(
        document.querySelector("[data-block-id='" + e[0] + "']")
      );
      var input = _this.getPinPos(
        document.querySelector("[data-block-id='" + e[1] + "']")
      );

      /* drawing */
      _this.ctx.beginPath();
      _this.ctx.moveTo(output.outputX, output.outputY);
      _this.ctx.lineTo(output.outputX + contraryStartOffset, output.outputY);
      _this.ctx.lineTo(input.inputX - contraryEndOffset - offset, input.inputY);

      _this.ctx.lineTo(input.inputX - offset, input.inputY);
      let arrowStyleValue;
      if(arrowStyles && arrowStyles[e[1]]) {
        arrowStyleValue = arrowStyles[e[1]];
        _this.ctx.strokeStyle = arrowStyleValue;
      }
      else {
        arrowStyleValue = _this.drawingLineColor;
      }
      _this.ctx.stroke();
      _this.ctx.strokeStyle = _this.drawingLineColor;

      if (_this.arrowMode){
        _this.canvas_arrow(_this.ctx, input.inputX - contraryEndOffset - offset, input.inputY, input.inputX - offset, input.inputY, 10, arrowStyleValue);
      }

    });
    this.imgData = this.ctx.getImageData(0, this.offsetDrawY * -1, 1920, 3000);
  }

  canvas_arrow(context, fromx, fromy, tox, toy, r, arrowcolor) {
    var x_center = tox;
    var y_center = toy;

    var angle;
    var x;
    var y;

    context.beginPath();

    angle = Math.atan2(toy-fromy,tox-fromx);
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.moveTo(x, y);

    angle += (1.0/3.0)*(2*Math.PI);
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.lineTo(x, y);

    angle += (1.0/3.0)*(2*Math.PI);
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.lineTo(x, y);

    context.closePath();
    context.fillStyle = arrowcolor ? arrowcolor : '#005EB8';
    context.fill();
  }


  drawCurveLine(c1_x, c1_y, c2_x, c2_y, e_x, e_y) {
    this.ctx.beginPath();
    this.ctx.moveTo(c1_x, c1_y);

    this.ctx.bezierCurveTo(c1_x, c1_y, c2_x, c2_y, e_x, e_y);
    this.ctx.putImageData(this.imgData, 0, this.offsetDrawY * -1);

    this.ctx.lineWidth = 4;

    this.ctx.strokeStyle = this.drawingLineColor;

    this.ctx.stroke();
  }



  updateOffset() {
    let _this = this;
    this.offsetDrawY = window.pageYOffset || document.documentElement.scrollTop;
    this.ctx.putImageData(this.imgData, 0, this.offsetDrawY * -1);


    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(function () {
      _this.draw(_this.connections, _this.arrowStyles);
      _this.count++;
    }, 50);

  }

  getPos(el) {
    return el.getBoundingClientRect();
  }

  /* return the coords of each pin */
  getPinPos(el) {
    let pos = this.getPos(el);

    return {
      rect: pos,
      inputX: pos.left,
      inputY: pos.top + pos.height / 2 ,
      outputX: pos.left + pos.width,
      outputY: pos.top + pos.height / 2
    };
  }
}

export default drawer;