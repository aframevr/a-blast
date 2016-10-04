/* global AFRAME, THREE */

/**
 * Draw spline.
 * Grab the spline object using `pointer`, which reaches into a component for the spline.
 * Some extra code done to generalize + decouple the component.
 */
AFRAME.registerComponent('spline-line', {
  schema: {
    pointer: {default: ''},  // `[componentName].[member]`.
    numPoints: {default: 250}
  },

  init: function () {
    var componentName;
    var data = this.data;
    var el = this.el;
    var self = this;
    var spline;

    this.pointMeshes = [];

    // TODO: Get `component-initialized` event.
    spline = getSpline();
    if (spline) {
      this.drawLine(spline);
    } else {
      componentName = data.pointer.split('.')[0];
      el.addEventListener('componentchanged', function (evt) {
        if (evt.detail.name !== componentName) { return; }
        self.drawLine(getSpline());
      });
    }

    function getSpline () {
      var split = data.pointer.split('.');
      var componentName = split.shift();
      var member = el.components[componentName];
      while (split.length) {
        if (!member) { return; }
        member = member[split.shift()];
      }
      return member;
    }
  },

  drawLine: function (spline) {
    var data = this.data;
    var el = this.el;
    var geometry;
    var i;
    var pointMeshes = this.pointMeshes;
    var material;

    // Create line.
    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random())
    });
    for (i = 0; i < data.numPoints; i++) {
      var point = spline.getPoint(i / data.numPoints);
      geometry.vertices.push(new THREE.Vector3(point.x, point.y, point.z));
    }
    geometry.verticesNeedsUpdate = true;

    // Draw points.
    spline.points.forEach(function addWaypoint (point) {
      var geometry = new THREE.SphereGeometry(0.2, 16, 16);
      var material = new THREE.MeshBasicMaterial({color: '#111'});
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(point.x, point.y, point.z);
      pointMeshes.push(mesh);
      el.sceneEl.object3D.add(mesh);
    });

    // Append line to scene.
    this.line = new THREE.Line(geometry, material);
    el.sceneEl.object3D.add(this.line);
  },

  remove: function () {
    var scene = this.el.sceneEl.object3D;
    if (!this.line) { return; }
    scene.remove(this.line);
    this.pointMeshes.forEach(function (point) {
      scene.remove(point);
    });
  }
});
