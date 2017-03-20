/* global AFRAME, THREE */

THREE.Spline = function ( points ) {

	this.points = points;

	var c = [], v3 = { x: 0, y: 0, z: 0 },
	point, intPoint, weight, w2, w3,
	pa, pb, pc, pd;

	this.initFromArray = function ( a ) {

		this.points = [];

		for ( var i = 0; i < a.length; i ++ ) {

			this.points[ i ] = { x: a[ i ][ 0 ], y: a[ i ][ 1 ], z: a[ i ][ 2 ] };

		}

	};

	this.getPoint = function ( k ) {

		point = ( this.points.length - 1 ) * k;
		intPoint = Math.floor( point );
		weight = point - intPoint;

		c[ 0 ] = intPoint === 0 ? intPoint : intPoint - 1;
		c[ 1 ] = intPoint;
		c[ 2 ] = intPoint  > this.points.length - 2 ? this.points.length - 1 : intPoint + 1;
		c[ 3 ] = intPoint  > this.points.length - 3 ? this.points.length - 1 : intPoint + 2;

		pa = this.points[ c[ 0 ] ];
		pb = this.points[ c[ 1 ] ];
		pc = this.points[ c[ 2 ] ];
		pd = this.points[ c[ 3 ] ];

		w2 = weight * weight;
		w3 = weight * w2;

		v3.x = interpolate( pa.x, pb.x, pc.x, pd.x, weight, w2, w3 );
		v3.y = interpolate( pa.y, pb.y, pc.y, pd.y, weight, w2, w3 );
		v3.z = interpolate( pa.z, pb.z, pc.z, pd.z, weight, w2, w3 );

		return v3;

	};

	this.getControlPointsArray = function () {

		var i, p, l = this.points.length,
			coords = [];

		for ( i = 0; i < l; i ++ ) {

			p = this.points[ i ];
			coords[ i ] = [ p.x, p.y, p.z ];

		}

		return coords;

	};

	// approximate length by summing linear segments

	this.getLength = function ( nSubDivisions ) {

		var i, index, nSamples, position,
			point = 0, intPoint = 0, oldIntPoint = 0,
			oldPosition = new THREE.Vector3(),
			tmpVec = new THREE.Vector3(),
			chunkLengths = [],
			totalLength = 0;

		// first point has 0 length

		chunkLengths[ 0 ] = 0;

		if ( ! nSubDivisions ) nSubDivisions = 100;

		nSamples = this.points.length * nSubDivisions;

		oldPosition.copy( this.points[ 0 ] );

		for ( i = 1; i < nSamples; i ++ ) {

			index = i / nSamples;

			position = this.getPoint( index );
			tmpVec.copy( position );

			totalLength += tmpVec.distanceTo( oldPosition );

			oldPosition.copy( position );

			point = ( this.points.length - 1 ) * index;
			intPoint = Math.floor( point );

			if ( intPoint !== oldIntPoint ) {

				chunkLengths[ intPoint ] = totalLength;
				oldIntPoint = intPoint;

			}

		}

		// last point ends with total length

		chunkLengths[ chunkLengths.length ] = totalLength;

		return { chunks: chunkLengths, total: totalLength };

	};

	this.reparametrizeByArcLength = function ( samplingCoef ) {

		var i, j,
			index, indexCurrent, indexNext,
			realDistance,
			sampling, position,
			newpoints = [],
			tmpVec = new Vector3(),
			sl = this.getLength();

		newpoints.push( tmpVec.copy( this.points[ 0 ] ).clone() );

		for ( i = 1; i < this.points.length; i ++ ) {

			//tmpVec.copy( this.points[ i - 1 ] );
			//linearDistance = tmpVec.distanceTo( this.points[ i ] );

			realDistance = sl.chunks[ i ] - sl.chunks[ i - 1 ];

			sampling = Math.ceil( samplingCoef * realDistance / sl.total );

			indexCurrent = ( i - 1 ) / ( this.points.length - 1 );
			indexNext = i / ( this.points.length - 1 );

			for ( j = 1; j < sampling - 1; j ++ ) {

				index = indexCurrent + j * ( 1 / sampling ) * ( indexNext - indexCurrent );

				position = this.getPoint( index );
				newpoints.push( tmpVec.copy( position ).clone() );

			}

			newpoints.push( tmpVec.copy( this.points[ i ] ).clone() );

		}

		this.points = newpoints;

	};

	// Catmull-Rom

	function interpolate( p0, p1, p2, p3, t, t2, t3 ) {

		var v0 = ( p2 - p0 ) * 0.5,
			v1 = ( p3 - p1 ) * 0.5;

		return ( 2 * ( p1 - p2 ) + v0 + v1 ) * t3 + ( - 3 * ( p1 - p2 ) - 2 * v0 - v1 ) * t2 + v0 * t + p1;

	}

}

 /**
  * Spline interpolation with waypoints.
  */
 AFRAME.registerComponent('curve-movement', {
   schema: {
     debug: {default: false},
     type: {default: 'single'},
     restTime: {default: 150},  // ms.
     speed: {default: 3},  // meters per second.
     loopStart: {default: 1},
     timeOffset: {default: 0}
   },

   init: function () {
     this.direction = 1;
   },

   isClosed: function () {
     return this.data.type === 'loop';
   },

   addPoints: function (points) {
     var data = this.data;
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
     this.time = this.data.timeOffset;
     this.initTime = null;
   },
   tick: function (time, delta) {
     var cycleTime;
     var data = this.data;
     var el = this.el;
     var percent;
     var point;
     var spline = this.spline;

     if (!this.initTime) {
       this.initTime = time;
     }

     // If not closed and reached the end, just stop (for now).
     if (this.end) {return;}
     if (!this.isClosed() && this.currentPointIndex === spline.points.length - 1) { return; }

     // Mod the current time to get the current cycle time and divide by total time.
     cycleTime = this.cycleTimes[this.currentPointIndex];

     var t = 0;
     var jump = false;
     if (this.time > cycleTime) {
       t = 1;
       jump = true;
     } else {
       t = this.time / cycleTime;
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

     this.time = time - this.initTime;

     if (this.time < 0) { console.log(percent); return; }

     point = spline.getPointFrom(percent, this.currentPointIndex);
     el.setAttribute('position', {x: point.x, y: point.y, z: point.z});
     this.lastPercent = percent;

     if (jump) {
       if (this.direction === 1) {
         if (this.currentPointIndex === spline.points.length - 2) {
           if (data.type === 'single') {
             this.end = true;
           } else if (data.type === 'loop') {
             this.currentPointIndex = this.data.loopStart;
           } else {
             this.direction = -1;
           }
         } else {
           this.currentPointIndex ++;
         }
       } else {
         this.currentPointIndex --;
         if (this.currentPointIndex < this.data.loopStart) {
           this.currentPointIndex = this.data.loopStart;
           this.direction = 1;
         }
       }
       this.initTime = time;
       this.time = 0;
     }
   }
 });

 function inOutSine (k) {
   return .5 * (1 - Math.cos(Math.PI * k));
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
