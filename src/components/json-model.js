/* globals AFRAME THREE */
AFRAME.registerComponent('json-model', {
  schema: {
    src: {type: 'src'},
    vertexcolors: {default: false},
    debugNormals: {default: false},
    debugNormalsLength: {default: 0.2}
  },

  init: function () {
    this.objectLoader = new THREE.ObjectLoader();
    this.objectLoader.setCrossOrigin('');
    this.helpers = new THREE.Group();
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
      self.helpers = new THREE.Group();

      // var Rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
      group.traverse(function (child) {
        if (!(child instanceof THREE.Mesh)) { return; }
/*
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
*/
        child.geometry.normalsNeedUpdate = true;
        child.geometry.verticesNeedUpdate = true;

        fnh = new THREE.FaceNormalsHelper(child, self.data.debugNormalsLength);
        self.helpers.add(fnh);
        vnh = new THREE.VertexNormalsHelper(child, self.data.debugNormalsLength);
        self.helpers.add(vnh);
      });
      self.el.setObject3D('helpers', self.helpers);
      self.el.setObject3D('mesh', group);
      self.el.emit('model-loaded', {format: 'json', model: group, src: src});
      self.helpers.visible = self.data.debugNormals;
    });

    this.helpers.visible = this.data.debugNormals;
  }
});
