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
    var el = this.el;
    var self = this;
    var split;
    var member;

    split = this.data.pointer.split('.');
    componentName = split.shift();

    // TODO: Get `component-initialized` event.
    if (el.components[componentName]) {
      this.drawLine(fetchMember(el.components[componentName], split));
    } else {
      el.addEventListener('componentchanged', function (evt) {
        if (evt.detail.name !== componentName) { return; }
        self.drawLine(fetchMember(el.components[componentName], split));
      });
    }

    function fetchMember (component, split) {
      var member = component;
      while (split.length) {
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
    var material;

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
    if (!this.line) { return; }
    this.el.sceneEl.object3D.remove(this.line);
  }
});
