/* global AFRAME */

/**
 * Move towards an entity.
 */
AFRAME.registerMovementPattern('splineRandom', {
  schema: {
    target: {type: 'selector'},
    speed: {default: 3}  // meters per second.
  },

  init: function () {
    var data = this.data;
  },

  tick: function (t, dt) {
    var cycleTime = this.cycleTime;
    var el = this.el;
    var point;
    var spline = this.spline;
  }
});

/**
 * Random point within spherical bounds.
 */
function getRandomPoint (radius) {
  var offsetToNeg = radius / 2;
  return [
    radius * Math.random() - offsetToNeg,
    radius * Math.random() + 3,
    radius * Math.random()
  ];
}
