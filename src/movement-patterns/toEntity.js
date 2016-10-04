/* global AFRAME */

/**
 * Move towards an entity.
 */
AFRAME.registerMovementPattern('toEntity', {
  schema: {
    debug: {default: false},
    target: {type: 'selector'},
    speed: {default: 2}  // meters per second.
  },

  init: function () {
    var initPos;
    var data = this.data;
    var el = this.el;
    var spline;
    var targetPos;

    if (!data.target.hasLoaded) {
      data.target.addEventListener('loaded', this.init.bind(this));
      return;
    }

    initPos = el.getComputedAttribute('position')
    targetPos = data.target.getComputedAttribute('position');

    spline = this.spline = new THREE.Spline();
    spline.initFromArray([
      [initPos.x, initPos.y, initPos.z],
      [targetPos.x, targetPos.y, targetPos.z],
      [initPos.x, initPos.y, initPos.z]
    ]);

    // Compute how long it takes to go through the whole spline using speed property (in ms).
    this.cycleTime = spline.getLength().total / data.speed * 1000;
  },

  update: function () {
    var data = this.data;
    var el = this.el;

    if (data.debug) {
      el.setAttribute('spline-line', {
        numPoints: 5,
        pointer: 'movement-pattern.movementPattern.spline'
      });
    }
  },

  tick: function (t, dt) {
    var cycleTime = this.cycleTime;
    var el = this.el;
    var point;
    var spline = this.spline;

    if (!spline) { return ;}

    // Get next point in the spline interpolation. `getPoint` takes a percentage.
    // Mod the current time to get the current cycle time and divide by total time.
    point = spline.getPoint((t % cycleTime) / cycleTime);
    el.setAttribute('position', {x: point.x, y: point.y, z: point.z});
  }
});
