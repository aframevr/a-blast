/* global AFRAME THREE */
AFRAME.registerComponent('enemybullet', {
  schema: {
    direction: {type: 'vec3'},
    speed: {default: 15}
  },

  init: function () {
    this.alive = true;
    this.direction = new THREE.Vector3(this.data.direction.x, this.data.direction.y, this.data.direction.z);
  },

  tick: function (time, delta) {
    var pos = this.el.getAttribute('position');
    var newPosition = new THREE.Vector3(pos.x, pos.y, pos.z).add(this.direction.clone().multiplyScalar(this.data.speed * delta / 1000));
    if (newPosition.length() > 30) {
      this.removeBullet();
      return;
    }

    this.el.setAttribute('position', newPosition);
    if (this.alive) {
      var head = this.el.sceneEl.camera.el.components['look-controls'].dolly.position;
      if (newPosition.distanceTo(head) < 0.25) {
        // document.getElementById('hurt').emit('player-hit');
        this.el.emit('player-hit');
        this.alive = false;
      }
    }
  },
  removeBullet: function () {
    this.el.parentElement.removeChild(this.el);
  },

  remove: function () {

/*    if (!this.model) { return; }
    this.el.removeObject3D('mesh');*/
  }
});
