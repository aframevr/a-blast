/* globals AFRAME ASHOOTER THREE */
AFRAME.registerComponent('bullet', {
  schema: {
    name: { default: '' },
    direction: { type: 'vec3' },
    maxSpeed: { default: 5.0 },
    initialSpeed: { default: 5.0 },
    position: { type: 'vec3' },
    acceleration: { default: 0.5 },
    destroyable: { default: false },
    owner: {default: 'player', oneOf: ['enemy', 'player']},
    color: {default: '#fff'}
  },

  init: function () {
    this.startEnemy = document.getElementById('start_enemy');
    this.backgroundEl = document.getElementById('border');
    this.bullet = ASHOOTER.BULLETS[this.data.name];
    this.bullet.definition.init.call(this);
    this.hit = false;
    this.direction = new THREE.Vector3();

    this.sounds = {
      'enemy_start': document.getElementById('explosion0'),
      'enemy0': document.getElementById('explosion0'),
      'enemy1': document.getElementById('explosion1'),
      'enemy2': document.getElementById('explosion2'),
      'enemy3': document.getElementById('explosion3'),
      'bullet': document.getElementById('hitbullet'),
      'background': document.getElementById('hitbullet')
    };
    this.soundVolumes = {
      'enemy_start': 0.7,
      'enemy0': 1,
      'enemy1': 1,
      'enemy2': 1,
      'enemy3': 1,
      'bullet': 0.4,
      'background': 0.2
    };
  },

  update: function (oldData) {
    var data = this.data;
    this.owner = this.data.owner;
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
      document.getElementById('hurtSound').components.sound.playSound();
    }
    else {
      if (type === 'bullet') {
        // data is the bullet entity collided with
        data.components.bullet.resetBullet();
        this.el.sceneEl.systems.explosion.createExplosion(type, data.object3D.position, data.getAttribute('bullet').color, 1, this.direction);
      }
      else if (type === 'background') {
        this.el.sceneEl.systems.decals.addDecal(data.point, data.face.normal);
        var posOffset = data.point.clone().sub(this.direction.clone().multiplyScalar(0.2));
        this.el.sceneEl.systems.explosion.createExplosion(type, posOffset, '#fff', 1, this.direction);
      }
      else if (type === 'enemy') {
        var enemy = data.getAttribute('enemy');
        console.log(enemy);
        if (data.components['enemy'].health <= 0) {
          this.el.sceneEl.systems.explosion.createExplosion('enemy', data.object3D.position, enemy.color, enemy.scale, this.direction, enemy.name);
        }
        else {
          this.el.sceneEl.systems.explosion.createExplosion('bullet', this.el.object3D.position, enemy.color, enemy.scale, this.direction);
        }
      }
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
      if (position.length() >= 50) {
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
          // Detect collision with the start game enemy
          var state = this.el.sceneEl.getAttribute('gamestate').state;
          if (state === 'STATE_MAIN_MENU') {
            var enemy = this.startEnemy;
            var helper = enemy.getAttribute('collision-helper');
            var radius = helper.radius;
            if (newBulletPosition.distanceTo(enemy.object3D.position) < radius + bulletRadius) {
              this.el.sceneEl.systems.explosion.createExplosion('enemy', this.el.getAttribute('position'), '#ffb911', 0.5, this.direction, 'enemy_start');
              enemy.emit('hit');
              document.getElementById('introMusic').components.sound.pauseSound();
              document.getElementById('mainThemeMusic').components.sound.playSound();
              return;
            }
          } else if (state === 'STATE_GAME_WIN' || state === 'STATE_GAME_OVER') {
            var enemy = document.getElementById('reset');
            var helper = enemy.getAttribute('collision-helper');
            var radius = helper.radius;
            if (newBulletPosition.distanceTo(enemy.object3D.position) < radius * 2 + bulletRadius * 2) {
              this.el.sceneEl.systems.explosion.createExplosion('enemy', this.el.getAttribute('position'), '#f00', 0.5, this.direction, 'enemy_start');
              this.el.sceneEl.emit('reset');
              return;
            }
          } else {
            // Detect collisions with all the active enemies
            var enemies = this.el.sceneEl.systems.enemy.activeEnemies;
            for (var i = 0; i < enemies.length; i++) {
              var enemy = enemies[i];
              var helper = enemy.getAttribute('collision-helper');
              if (!helper) continue;
              var radius = helper.radius;
              if (newBulletPosition.distanceTo(enemy.object3D.position) < radius + bulletRadius) {
                enemy.emit('hit');
                this.hitObject('enemy', enemy);
                return;
              }
            }
          }

          var bullets = this.system.activeBullets;
          for (var i = 0; i < bullets.length; i++) {
            var bullet = bullets[i];
            var data = bullet.components['bullet'].data;
            if (data.owner === 'player' || !data.destroyable) { continue; }

            var colhelper = bullet.components['collision-helper'];
            if (!colhelper) continue;
            var enemyBulletRadius = colhelper.data.radius;
            if (newBulletPosition.distanceTo(bullet.getAttribute('position')) < enemyBulletRadius + bulletRadius) {
              this.hitObject('bullet', bullet);
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
      var background = this.backgroundEl.getObject3D('mesh');
      if (background) {
        var collisionResults = ray.intersectObjects(background.children, true);
        var self = this;
        collisionResults.forEach(function (collision) {
          if (collision.distance < position.length()) {
            if (!collision.object.el) { return; }
            self.hitObject('background', collision);
            return;
          }
        });
      }
    };
  })()
});
