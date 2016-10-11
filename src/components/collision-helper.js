AFRAME.registerComponent('collision-helper', {
  schema: {
    type: {default: 'sphere', oneOf: ['sphere', 'box']},
    radius: {default: 1, if: {type: ['sphere']}},
    debug: {default: false},
    color: {type: 'color', default: 0x888888}
  },

  init: function () {
    var el = this.el;
    var data = this.data;
    var self = this;

    this.geometry = new THREE.IcosahedronGeometry(data.radius, 1);
    this.material = new THREE.MeshBasicMaterial({ color: data.color, wireframe: true});
    this.helperMesh = new THREE.Mesh(this.geometry, this.material);
    this.helperMesh.visible = data.debug;
    // el.sceneEl.object3D.add(this.helperMesh);
    el.setObject3D('collision-helper-mesh', self.helperMesh);
  },

  update: function (oldData) {
    var data = this.data;
    this.helperMesh.visible = data.debug;
    console.log(data.radius);
    this.helperMesh.geometry = new THREE.IcosahedronGeometry(data.radius, 1);
  }
});
