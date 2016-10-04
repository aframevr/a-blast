AFRAME.registerComponent('bullet', {
  schema: {
    name: { default: '' },
    direction: { type: 'vec3' },
    maxSpeed: { default: 5.0 },
    position: { type: 'vec3' },
    acceleration: { default: 0.5 },
    owner: { default: 'player', oneOf: ['enemy', 'player']},
  },

  init: function () {
    this.bullet = AFRAME.BULLETS[this.data.name];
    this.bullet.definition.init.call(this);
    this.resetBullet();

    this.direction = new THREE.Vector3();
  },

  update: function (oldData) {
    this.direction.set(this.data.direction.x, this.data.direction.y, this.data.direction.z);
    this.currentAcceleration = this.data.acceleration;
    this.speed = 0;
    this.startPosition = this.data.position;
  },

  hitObject: function () {
    this.bullet.definition.onHit.call(this);
    this.hit = true;
    if (this.data.owner === 'enemy') {
      this.el.emit('player-hit');
    }
  },

  resetBullet: function () {
    this.hit = false;
    this.bullet.definition.reset.call(this);
    this.el.pool.returnEntity(this.el);
  },

  tick: (function () {
    var position = new THREE.Vector3();
    var direction = new THREE.Vector3();
    return function tick (time, delta) {

      // Update acceleration based on the friction
      position.copy(this.el.getAttribute('position'));
      var friction = 0.005 * delta;
      if (this.currentAcceleration > 0) {
        this.currentAcceleration -= friction;
      } else if (this.currentAcceleration <= 0) {
        this.currentAcceleration = 0;
      }

      // Update speed based on acceleration
      this.speed += this.currentAcceleration;

      // Set new position
      direction.copy(this.direction);
      var newBulletPosition = position.add(direction.multiplyScalar(this.speed));
      this.el.setAttribute('position', newBulletPosition);

      // Check if the bullet is lost in the sky
      if (position.length() >= 80) {
        this.resetBullet();
        return;
      }

      // Detect collision dependng on the own
      if (this.data.owner === 'player') {

        // megahack
        this.el.object3D.lookAt(this.direction.clone().multiplyScalar(1000));

        // Detect collision against enemies
        if (this.data.owner === 'player') {
          var enemies = document.querySelectorAll('[enemy]');
          for (var i = 0; i < enemies.length; i++) {
            if (newBulletPosition.distanceTo(enemies[i].object3D.position) < 1) {
              enemies[i].emit('hit');
              this.hitObject('enemy');
              return;
            }
          }
        };
      } else {
        var head = this.el.sceneEl.camera.el.components['look-controls'].dolly.position;
        if (newBulletPosition.distanceTo(head) < 0.25) {
          this.hitObject('player');
        }
      }
    }
  })()
});
