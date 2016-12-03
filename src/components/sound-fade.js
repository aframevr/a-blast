/* globals AFRAME ABLAST */

AFRAME.registerComponent('sound-fade', {
  schema: {
    from: {default: 0.0},
    to: {default: 1.0},
    duration: {default: 1000},
  },

  init: function () {
  	if (this.el.getAttribute('sound')) {
      this.el.setAttribute('sound', 'volume', this.data.from);
      this.fadeEnded = false;
      this.diff = this.data.to - this.data.from;
    }
    else {
      this.fadeEnded = true;
    }
  },

  update: function (oldData) {
      this.endTime = undefined; 
      this.fadeEnded = false;
      this.diff = this.data.to - this.data.from;
  },

  tick: function (time, delta) {
    if (this.fadeEnded) {
      return;
    }
    if (this.endTime === undefined) {
      this.endTime = time + this.data.duration;
      return;
    }

    var ease = 1 - (this.endTime - time) / this.data.duration;
    ease = Math.max(0, Math.min(1, ease * ease)); //easeQuadIn
    var vol = this.data.from + this.diff * ease;
    this.el.setAttribute('sound', 'volume', vol);
    if (ease === 1) {
      this.fadeEnded = true;
    }
  }
});