/* globals AFRAME THREE */
AFRAME.registerComponent('collision-helper', {
  schema: {
    type: {default: 'sphere', oneOf: ['sphere', 'box']},
    radius: {default: 1, if: {type: ['sphere']}},
    debug: {default: false},
    color: {type: 'color', default: 0x888888}
  },

  init: function () {
    var data = this.data;

    this.geometry = new THREE.IcosahedronGeometry(1, 1);
    this.material = new THREE.MeshBasicMaterial({color: data.color, wireframe: true});
    this.helperMesh = null;

    if (data.debug) {
      this.createHelperMesh();
    }
  },

  createHelperMesh: function () {
    var radius = this.data.radius;
    this.helperMesh = new THREE.Mesh(this.geometry, this.material);
    this.helperMesh.visible = true;
    this.helperMesh.scale.set(radius, radius, radius);
    this.el.setObject3D('collision-helper-mesh', this.helperMesh);
  },

  update: function (oldData) {
    var data = this.data;
    if (!data.debug) { return; }

    if (!this.helperMesh) {
      this.createHelperMesh();
    } else {
      this.material.color.set(data.color);
      this.helperMesh.scale.set(data.radius, data.radius, data.radius);
      this.helperMesh.visible = data.debug;
    }
  }
});
