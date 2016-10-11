var Sphere = require('../sphere');

/* globals AFRAME THREE */
AFRAME.registerComponent('json-model', {
  schema: {
    src: {type: 'src'},
    vertexcolors: {default: false}
  },

  init: function () {
    this.objectLoader = new THREE.ObjectLoader();
    this.objectLoader.setCrossOrigin('');
  },

  fixNormal: function (vector) {
    var t = vector.y;
    vector.y = -vector.z;
    vector.z = t;
  },

  update: function (oldData) {
    var self = this;
    var src = this.data.src;
    if (!src || src === oldData.src) { return; }

    this.objectLoader.load(this.data.src, function (group) {
      // var Rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
      group.traverse(function (child) {
        if (!(child instanceof THREE.Mesh)) { return; }
        // child.position.applyMatrix4(Rotation);
        child.geometry.faces.forEach(face => {
          self.fixNormal(face.normal);
          face.vertexNormals.forEach(vertex => {
            if (!vertex.hasOwnProperty('fixed')) {
              self.fixNormal(vertex);
              vertex.fixed = true;
            }
          });
        });
        child.geometry.normalsNeedUpdate = true;
        child.geometry.verticesNeedUpdate = true;
        // child.material = new THREE.MeshPhongMaterial();
      });
      self.el.setObject3D('mesh', group);
      self.el.emit('model-loaded', {format: 'json', model: group, src: src});
    });
  }
});
