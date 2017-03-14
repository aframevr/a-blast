AFRAME.registerComponent('restrict-position', {
  schema: {
  },

  init: function () {
    this.active = !AFRAME.utils.device.checkHeadsetConnected();
    this.radius = 2;
  },

  tick: function (time, delta) {
    if (!this.active) { return; }
    var fromCircleToObject = new THREE.Vector3();
    var y = this.el.object3D.position.y;
    fromCircleToObject.copy(this.el.object3D.position);
    var len = this.radius / fromCircleToObject.length();
    if (len < 0.98) {
      fromCircleToObject.multiplyScalar(this.radius / fromCircleToObject.length());
      this.el.setAttribute('position', {
        x: fromCircleToObject.x,
        y: y,
        z: fromCircleToObject.z
      });
    }
  }
});
