/* global AFRAME */

/**
 * Spline interpolation between random points.
 */
AFRAME.registerMovementPattern('random', {
  schema: {
    boundingRadius: {default: 30},
    debug: {default: false},
    speed: {default: 3, min: 0, max: 20}  // meters per second.
  },

  init: function () {
    var currentPos;
    var data = this.data;
    var el = this.el;
    var spline;

    // Build closed spline starting from and ending at current position.
    // TODO: Add safety bubble around player.
    currentPos = el.object3D.position;
    spline = this.spline = new THREE.Spline();
    spline.initFromArray([
      [currentPos.x, currentPos.y, currentPos.z],
      getRandomPoint(data.boundingRadius),
      getRandomPoint(data.boundingRadius),
      getRandomPoint(data.boundingRadius),
      getRandomPoint(data.boundingRadius),
      [currentPos.x, currentPos.y, currentPos.z]
    ]);

    // Compute how long it takes to go through the whole spline using speed property (in ms).
    this.cycleTime = spline.getLength().total / data.speed * 1000;

    if (data.debug) {
      el.setAttribute('spline-line', {pointer: 'movement-pattern.movementPattern.spline'});
    }
  },

  tick: function (t, dt) {
    var cycleTime = this.cycleTime;
    var el = this.el;
    var point;
    var spline = this.spline;

    // Get next point in the spline interpolation. `getPoint` takes a percentage.
    // Mod the current time to get the current cycle time and divide by total time.
    point = spline.getPoint((t % cycleTime) / cycleTime);
    el.setAttribute('position', {x: point.x, y: point.y, z: point.z});
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
