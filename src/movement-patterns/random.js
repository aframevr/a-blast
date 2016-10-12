/* global AFRAME, THREE */

/**
 * Spline interpolation with waypoints.
 */
AFRAME.registerMovementPattern('random', {
  schema: {
    closed: {default: false},
    debug: {default: false},
    randomBoundsMin: {type: 'vec3', default: {x: -10, y: 0, z: -3}},
    randomBoundsMax: {type: 'vec3', default: {x: 10, y: 10, z: -10}},
    randomNumPoints: {default: 4},
    restTime: {default: 1500},  // ms.
    speed: {default: 3}  // meters per second.
  },

  init: function () {
    var currentPos;
    var data = this.data;
    var el = this.el;
    var i;
    var points;
    var spline;
    var chunkLengths;

    // Set waypoints.
    currentPos = el.object3D.position;
    points = [[currentPos.x, currentPos.y, currentPos.z]];
    for (i = 0; i < data.randomNumPoints; i++) {
      points.push(getRandomPoint(data.randomBoundsMin, data.randomBoundsMax));
    }
    if (data.closed) { points.push([currentPos.x, currentPos.y, currentPos.z]); }

    // Build spline.
    spline = this.spline = ASpline();
    spline.initFromArray(points);

    // Keep track of current point to get to the next point.
    this.currentPointIndex = 0;

    // Compute how long to get from each point to the next for each chunk using speed.
    chunkLengths = spline.getLength().chunks;
    this.cycleTimes = chunkLengths.map(function (chunkLength, i) {
      if (i === 0) { return null; }
      return (chunkLength - chunkLengths[i - 1]) / data.speed * 1000;
    }).filter(function (length) { return length !== null; });

    // Keep a local time to reset at each point, for separate easing from point to point.
    this.time = 0;
    this.restTime = 0;
  },

  update: function () {
    var data = this.data;
    var el = this.el;

    // Visual debug stuff.
    if (data.debug) {
      el.setAttribute('spline-line', {pointer: 'movement-pattern.movementPattern.spline'});
    } else {
      el.removeAttribute('spline-line');
    }
  },

  tick: function (t, dt) {
    var cycleTime;
    var data = this.data;
    var el = this.el;
    var percent;
    var point;
    var reachedPoint;
    var restTime = this.restTime;
    var spline = this.spline;

    // If not closed and reached the end, just stop (for now).
    if (!data.closed && this.currentPointIndex === spline.points.length - 1) { return; }

    // If resting, increment rest time and check if done resting.
    if (restTime && data.restTime && restTime > data.restTime) {
      this.restTime = 0;
    } else if (restTime) {
      this.restTime += dt;
      return;
    }

    // Mod the current time to get the current cycle time and divide by total time.
    cycleTime = this.cycleTimes[this.currentPointIndex];
    percent = inOutCubic(this.time % cycleTime / cycleTime);

    // Check if next point reached. If so, then update state and start resting.
    reachedPoint = this.lastPercent <= 1 && percent >= 0 && percent < this.lastPercent;
    if (reachedPoint) {
      el.emit('waypointreached', {
        index: this.currentPointIndex,
        position: el.getAttribute('position')
      });

      // If not closed and reached the end, just stop (for now).
      if (!data.closed && this.currentPointIndex === spline.points.length - 1) { return; }

      // Reset state.
      this.lastPercent = 0;
      this.time = 0;
      this.restTime = 1;

      // Subtract 2 because it's a closed spline, the first and last points are the same.
      if (this.currentPointIndex === spline.points.length - 2) {
        this.currentPointIndex = 0;
      } else {
        this.currentPointIndex++;
      }
      return;
    }

    // Get next point in the spline using interpolation method.
    // `getPoint/getPointFrom` takes a percentage which can be used for easing.
    this.time += dt;
    point = spline.getPointFrom(percent, this.currentPointIndex);
    el.setAttribute('position', {x: point.x, y: point.y, z: point.z});
    this.lastPercent = percent;
  }
});

/**
 * Random point between two bounds.
 */
function getRandomPoint (randomBoundsMin, randomBoundsMax) {
  function randBetween (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return [
    randBetween(randomBoundsMin.x, randomBoundsMax.x),
    randBetween(randomBoundsMin.y, randomBoundsMax.y),
    randBetween(randomBoundsMin.z, randomBoundsMax.z)
  ];
}

function inOutCubic (k) {
  if ((k *= 2) < 1) {
    return 0.5 * k * k * k;
  }
  return 0.5 * ((k -= 2) * k * k + 2);
}

/**
 * Spline with point to point interpolation.
 */
function ASpline (points) {
  var spline = new THREE.Spline(points);

  /**
   * Interpolate between pointIndex and the next index.
   *
   * k {number} - From 0 to 1.
   * pointIndex {number} - Starting point index to interpolate from.
   */
  spline.getPointFrom = function (k, pointIndex) {
    var c, pa, pb, pc, pd, points, midpoint, w2, w3, v3, weight;
    points = this.points;

    midpoint = pointIndex + k;

    c = [];
    c[0] = pointIndex === 0 ? pointIndex : pointIndex - 1;
    c[1] = pointIndex;
    c[2] = pointIndex > points.length - 2 ? points.length - 1 : pointIndex + 1;
    c[3] = pointIndex > points.length - 3 ? points.length - 1 : pointIndex + 2;

    pa = points[c[0]];
    pb = points[c[1]];
    pc = points[c[2]];
    pd = points[c[3]];

    weight = midpoint - pointIndex;
    w2 = weight * weight;
    w3 = weight * w2;

    v3 = {};
    v3.x = interpolate(pa.x, pb.x, pc.x, pd.x, weight, w2, w3);
    v3.y = interpolate(pa.y, pb.y, pc.y, pd.y, weight, w2, w3);
    v3.z = interpolate(pa.z, pb.z, pc.z, pd.z, weight, w2, w3);
    return v3;
  };
  spline.getPointFrom = spline.getPointFrom.bind(spline);

  /**
   * Catmull-Rom
   */
  function interpolate (p0, p1, p2, p3, t, t2, t3) {
    var v0 = (p2 - p0) * 0.5;
    var v1 = (p3 - p1) * 0.5;
    return (2 * (p1 - p2) + v0 + v1) * t3 + (-3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
  }

  return spline;
}
