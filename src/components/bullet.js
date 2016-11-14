/* globals AFRAME ASHOOTER THREE */
AFRAME.registerComponent('bullet', {
  schema: {
    name: { default: '' },
    direction: { type: 'vec3' },
    maxSpeed: { default: 5.0 },
    initialSpeed: { default: 5.0 },
    position: { type: 'vec3' },
    acceleration: { default: 0.5 },
    owner: {default: 'player', oneOf: ['enemy', 'player']}
  },

  init: function () {
    this.backgroundEl = document.getElementById('border');
    this.bullet = ASHOOTER.BULLETS[this.data.name];
    this.bullet.definition.init.call(this);
    this.hit = false;
    this.direction = new THREE.Vector3();
  },

  update: function (oldData) {
    var data = this.data;
    this.direction.set(data.direction.x, data.direction.y, data.direction.z);
    this.currentAcceleration = data.acceleration;
    this.speed = data.initialSpeed;
    this.startPosition = data.position;
  },

  hitObject: function (type, data) {
    this.bullet.definition.onHit.call(this);
    this.hit = true;
    if (this.data.owner === 'enemy') {
      this.el.emit('player-hit');
    }
    if (type === 'background') {
      this.el.sceneEl.systems.decals.addDecal(data.point, data.face.normal);
    }
    this.resetBullet();
  },

  resetBullet: function () {
    this.hit = false;
    this.bullet.definition.reset.call(this);

    this.direction.set(this.data.direction.x, this.data.direction.y, this.data.direction.z);
    this.currentAcceleration = this.data.acceleration;
    this.speed = this.data.initialSpeed;
    this.startPosition = this.data.position;

    this.system.returnBullet(this.data.name, this.el);
  },

  tick: (function () {
    var position = new THREE.Vector3();
    var direction = new THREE.Vector3();
    return function tick (time, delta) {
      this.bullet.definition.tick.call(this, time, delta);

      // Align the bullet to its direction
      this.el.object3D.lookAt(this.direction.clone().multiplyScalar(1000));

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
      if (this.speed > this.data.maxSpeed) { this.speed = this.data.maxSpeed; }

      // Set new position
      direction.copy(this.direction);
      var newBulletPosition = position.add(direction.multiplyScalar(this.speed));
      this.el.setAttribute('position', newBulletPosition);

      // Check if the bullet is lost in the sky
      if (position.length() >= 80) {
        this.resetBullet();
        return;
      }

      var collisionHelper = this.el.getAttribute('collision-helper');
      if (!collisionHelper) { return; }

      var bulletRadius = collisionHelper.radius;

      // Detect collision depending on the owner
      if (this.data.owner === 'player') {
        // megahack

        // Detect collision against enemies
        if (this.data.owner === 'player') {
          var enemies = this.el.sceneEl.systems.enemy.activeEnemies;
          for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];
            var enemyHelper = enemy.getAttribute('collision-helper');
            if (!enemyHelper) continue;
            if (newBulletPosition.distanceTo(enemies[i].object3D.position) < enemyHelper.radius + bulletRadius) {
              enemy.emit('hit');
              this.hitObject('enemy', enemy);
              return;
            }
          }
        }
      } else {
        // @hack Any better way to get the head position ?
        var head = this.el.sceneEl.camera.el.components['look-controls'].dolly.position;
        if (newBulletPosition.distanceTo(head) < 0.25 + bulletRadius) {
          this.hitObject('player');
          return;
        }
      }

      // Detect collission aginst the background
      var ray = new THREE.Raycaster(position, direction.clone().normalize());
      var collisionResults = ray.intersectObjects(this.backgroundEl.getObject3D('mesh').children, true);
      var self = this;
      collisionResults.forEach(function (collision) {
        if (collision.distance < position.length()) {
          if (!collision.object.el) { return; }
          self.hitObject('background', collision);
          return;
        }
      });
    };
  })()
});
