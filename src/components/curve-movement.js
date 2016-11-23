/* global AFRAME, THREE */

/**
 * Spline interpolation with waypoints.
 */
AFRAME.registerComponent('curve-movement', {
  schema: {
    debug: {default: false},
    type: {default: 'single'},
    restTime: {default: 150},  // ms.
    speed: {default: 4},  // meters per second.
    loopStart: {default: 0},
    timeOffset: {default: 0}
  },

  init: function () {
    this.direction = 1;
  },

  isClosed: function () {
    return this.data.type === 'loop';
  },

  addPoints: function (points) {
    var currentPos;
    var data = this.data;
    var el = this.el;
    var i;
    var spline;
    var chunkLengths;

    // Set waypoints.
    if (data.type === 'loop') {
      points = points.slice(0); // clone array as we'll need to modify it
      points.push(points[this.data.loopStart]);
    }

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
    this.time = this.data.timeOffset;
    this.initTime = null;
    this.restTime = 0;
    this.direction = 1;
    this.end = false;
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
  play: function () {
    console.info("Playing", this.data.timeOffset);
    this.time = this.data.timeOffset;
  },
  tick: function (time, delta) {
    var cycleTime;
    var data = this.data;
    var el = this.el;
    var percent;
    var point;
    var reachedPoint;
    var restTime = this.restTime;
    var spline = this.spline;


/*
    time = time/2;
    if (!this.initTime) {
      this.initTime = time;
    }
*/
    // If not closed and reached the end, just stop (for now).
    if (this.end) {return;}
    if (!this.isClosed() && this.currentPointIndex === spline.points.length - 1) { return; }

    // If resting, increment rest time and check if done resting.
/*
    if (restTime && data.restTime && restTime > data.restTime) {
      this.restTime = 0;
    } else if (restTime) {
      this.restTime += dt;
      return;
    }
*/

    // Mod the current time to get the current cycle time and divide by total time.
    cycleTime = this.cycleTimes[this.currentPointIndex];
    //console.log(time);
    //this.time = time - this.initTime;
    var t = 0;
    var jump = false;
    if (data.type === 'single' || data.type === 'pingpong' || true) {
      if (this.time > cycleTime) {
        t = 1;
        jump = true;
      } else {
        t = this.time / cycleTime;
      }
    } else {
      t = this.time % cycleTime / cycleTime;
    }

    if (this.direction === -1) {
      t = 1 - t;
    }
    
    if (data.type === 'single') {
      percent = inOutSine(t);
    }
    else {
      percent = t;
    }

    // Check if next point reached. If so, then update state and start resting.
/*
    reachedPoint = (this.lastPercent <= 1 && percent >= 0 && percent < this.lastPercent) || t === 1;
    if (reachedPoint) {
      el.emit('waypointreached', {
        index: this.currentPointIndex,
        position: el.getAttribute('position')
      });

      // If not closed and reached the end, just stop (for now).
      console.log(this.currentPointIndex, spline.points.length);
      if (!this.isClosed() && this.currentPointIndex === spline.points.length - 1) { return; }

      // Reset state.
      this.lastPercent = 0;
      this.time = 0;
      this.restTime = 1;

      // Subtract 2 because it's a closed spline, the first and last points are the same.
      if (this.currentPointIndex === spline.points.length - 2) {
        if (data.type !== 'single') {
          this.currentPointIndex = 0;
        }
      } else {
        this.currentPointIndex++;
      }
      return;
    }
*/

    // Get next point in the spline using interpolation method.
    // `getPoint/getPointFrom` takes a percentage which can be used for easing.

    this.time += delta;
    if (this.time < 0) { return; }

    point = spline.getPointFrom(percent, this.currentPointIndex);
    el.setAttribute('position', {x: point.x, y: point.y, z: point.z});
    this.lastPercent = percent;

    if (jump) {
      if (this.currentPointIndex === spline.points.length - 2) {
        if (data.type === 'single') {
          this.end = true;
        } else {
          this.currentPointIndex = this.data.loopStart;
          if (data.type === 'pingpong') {
            spline.points.reverse();
          }
        }
      } else {
        this.currentPointIndex ++;
      }
      this.time = 0;
      //this.initTime = time;
    }
  }
});

function inOutSine(k) {
  return .5 * (1 - Math.cos(Math.PI * k));

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
