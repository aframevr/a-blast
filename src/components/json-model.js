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

  update: function (oldData) {
    var self = this;
    var src = this.data.src;
    if (!src || src === oldData.src) { return; }
    this.objectLoader.load(src, function (group) {
      var Rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
      group.traverse(function (child) {
        if (!(child instanceof THREE.Mesh)) { return; }

        child.position.applyMatrix4(Rotation);

        if (self.data.vertexcolors || child.name=='red' || child.name=="sky" || child.name=='glow') { // <= @hack this should be here
          child.material= new THREE.MeshBasicMaterial({ vertexColors: true }); // <= neither this
        }
      });

      self.el.setObject3D('mesh', group);
      self.el.emit('model-loaded', {format: 'json', model: group, src: src});
    });
  }
});
