/* global AFRAME, THREE */

/**
 * Movement pattern.
 * Currently random movement powered by spline interpolation.
 * Can extend later.
 */
AFRAME.registerComponent('enemy-movement', {
  schema: {
    type: {default: 'random'},
    boundingRadius: {default: 30},
    speed: {default: 10}  // meters per second.
  },

  init: function () {
    var currentPos;
    var data = this.data;
    var spline;

    // Build closed spline starting from and ending at current position.
    // TODO: Add safety bubble around player.
    currentPos = this.el.object3D.position;
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

/**
 * Draw spline.
 */
AFRAME.registerComponent('enemy-movement-debug', {
  dependencies: ['enemy-movement'],

  schema: {
    numPoints: {default: 100}
  },

  init: function () {
    var data = this.data;
    var el = this.el;
    var geometry;
    var i;
    var material;
    var spline;

    spline = el.components['enemy-movement'].spline;

    // Create line.
    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random())
    });
    for (i = 0; i < data.numPoints; i++){
      var point = spline.getPoint(i / data.numPoints);
      geometry.vertices.push(new THREE.Vector3(point.x, point.y, point.z));
    }
    geometry.verticesNeedsUpdate = true;

    // Append line to scene.
    this.line = new THREE.Line(geometry, material);
    el.sceneEl.object3D.add(this.line);
  },

  remove: function () {
    this.el.sceneEl.object3D.remove(this.line);
  }
});
