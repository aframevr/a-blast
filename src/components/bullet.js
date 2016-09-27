/* global AFRAME THREE */
AFRAME.registerComponent('bullet', {
  schema: {
    direction: { type: 'vec3' },
    speed: { default: 5.0 },
    position: { type: 'vec3' },
    acceleration: { default: 5.0 }
  },

  init: function () {
    this.direction = new THREE.Vector3(this.data.direction.x, this.data.direction.y, this.data.direction.z);
    this.currentAcceleration = this.data.acceleration;
    this.startPosition = this.data.position;
    this.hit = false;
  },
  hitObject: function () {
    this.el.setAttribute('material', {color: '#AAA'});
    this.hit = true;
  },
  removeBullet: function () {
    this.el.parentElement.removeChild(this.el);
  },
  tick: function (time, delta) {
    var pos = this.el.getAttribute('position');

    if (this.hit) {
      var offset = time - this.lastTimeWithoutHit;
      var t0 = offset / 1000;
      // t = TWEEN.Easing.Exponential.Out(t0);
      var t = Math.sin(t0);
      var sca = 1 + 5 * t;

      this.el.setAttribute('scale', {x: sca, y: sca, z: sca});
      this.el.getObject3D('mesh').material.transparent = true;
      this.el.getObject3D('mesh').material.opacity = 1 - t0;
      if (t0 > 1) {
        this.removeBullet();
      }
      return;
    }

    var position = new THREE.Vector3(pos.x, pos.y, pos.z);
    if (position.length() >= 15) {
      var ray = new THREE.Raycaster(this.startPosition, this.direction.clone().normalize());
      var collisionResults = ray.intersectObjects(document.getElementById('bigsphere').object3D.children, true);
      var self = this;
      collisionResults.forEach(function (collision) {
        if (collision.distance < position.length()) {
          if (!collision.object.el) { return; }
          if (collision.faceIndex === 1494) {
             // Hack to check collision against the counter face
            if (self.el.sceneEl.getAttribute('game').state === 'game-over') {
              self.el.emit('game-start');
            }
          }
          self.el.setAttribute('position', collision.point);
          self.hitObject();
        }
      });

      if (position.length() >= 25) {
        this.removeBullet();
      }
    }

    this.lastTimeWithoutHit = time;

    if (this.currentAcceleration > 1) {
      this.currentAcceleration -= 2 * delta / 1000.0;
    } else if (this.currentAcceleration <= 1) {
      this.currentAcceleration = 1;
    }

    this.el.setAttribute('scale', {x: 1, y: 1, z: 1.5 * this.currentAcceleration});

    var newPosition = new THREE.Vector3(pos.x, pos.y, pos.z).add(this.direction.clone().multiplyScalar(this.currentAcceleration * this.data.speed * delta / 1000));
    this.el.setAttribute('position', newPosition);

    // megahack
    this.el.object3D.lookAt(this.direction.clone().multiplyScalar(1000));

    var enemies = document.querySelectorAll('[enemy]');
    for (var i = 0; i < enemies.length; i++) {
      if (newPosition.distanceTo(enemies[i].object3D.position) < 1) {
        enemies[i].emit('hit');
        this.hitObject();
        return;
      }
    }
  }
});
