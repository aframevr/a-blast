/* global AFRAME THREE*/
AFRAME.BULLETS = {};

AFRAME.registerBullet = function (name, data, definition) {

  if (AFRAME.BULLETS[name]) {
    throw new Error('The bullet `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same bullet ' +
                    'or two different bullets of the same name.');
  }

  AFRAME.BULLETS[name] = {
    data: data,
    definition: definition
  };
};

AFRAME.registerSystem('bullet', {
  init: function () {
    this.initializePool();
  },

  initializePool: function () {
    this.pool = {};
    for (var bullet in AFRAME.BULLETS) {
      this.pool[bullet] = [];
      var definition = AFRAME.BULLETS[bullet].data;
      console.log(definition);
      for (var i = 0; i < definition.poolSize; i++) {
        this.addNewBulletToPool(bullet, definition);
      }
    }
  },

  addNewBulletToPool: function (name, definition) {
    var bullet = this.createNewBullet(name, definition);
    this.pool[name].push(bullet);
    return bullet;
  },

  createNewBullet: function (name, definition) {
    var bulletEntity = document.createElement('a-entity');
    bulletEntity.setAttribute('bullet', {
      name: name,
      speed: definition.speed,
      acceleration: definition.acceleration
    });
    bulletEntity.id = 'bullet_' + name + '_' + (this.pool[name].length + 1);
    bulletEntity.setAttribute('visible', false);
    this.sceneEl.appendChild(bulletEntity);
    return bulletEntity;
  },

  activateBullet: function (bullet, extraData) {
    // @dirty
    bullet.setAttribute('position', extraData.position);
    for (var attr in extraData) {
      bullet.setAttribute('bullet', attr, extraData[attr]);
    }
    bullet.setAttribute('bullet', 'active', true);
    bullet.setAttribute('visible', true);
  },

  deactivateBullet: function (bullet) {
    bullet.setAttribute('bullet', 'active', false);
    bullet.setAttribute('visible', false);
  },

  getBullet: function (name, extraData) {
    for (var i = 0; i < this.pool[name].length; i++) {
      var bullet = this.pool[name][i];
      if (!bullet.getComputedAttribute('bullet').active) {
        this.activateBullet(bullet, extraData);
        return bullet;
      }
    }
    // If we don't find anything, we just create a new one and return it
    console.warn('Exceded pool size for bullet', name, this.pool[name].length);
    var bullet = this.addNewBulletToPool(name, AFRAME.BULLETS[name]);
    this.activateBullet(bullet, extraData);
    return bullet;
  }
});

AFRAME.registerComponent('bullet', {
  schema: {
    name: { default: '' },
    direction: { type: 'vec3' },
    speed: { default: 5.0 },
    position: { type: 'vec3' },
    acceleration: { default: 5.0 },
    active: { default: false }
  },
  init: function () {
    this.hit = false;
    this.direction = new THREE.Vector3();
    this.bullet = AFRAME.BULLETS[this.data.name];
    this.bullet.definition.init.call(this);
  },
  update: function (oldData) { if (!oldData.active && this.data.active) {
      this.hit = false;
    }
    this.direction.set(this.data.direction.x, this.data.direction.y, this.data.direction.z);
    this.currentAcceleration = this.data.acceleration;
    this.startPosition = this.data.position;
  },
  hitObject: function () {
    this.el.setAttribute('material', {color: '#AAA'});
    this.hit = true;
  },
  resetBullet: function () {
    this.el.setAttribute('material', {color: '#ff0'});
    this.el.setAttribute('scale', {x: 1, y: 1, z: 1});
    this.el.setAttribute('visible', false);
    this.el.getObject3D('mesh').material.transparent = false;
    this.el.getObject3D('mesh').material.opacity = 1;
    this.system.deactivateBullet(this.el);
  },
  tick: function (time, delta) {
    if (!this.data.active) { return; }
    var pos = this.el.getAttribute('position');

    if (this.hit) {
      console.log('hit!!');
      var offset = time - this.lastTimeWithoutHit;
      var t0 = offset / 1000;
      // t = TWEEN.Easing.Exponential.Out(t0);
      var t = Math.sin(t0);
      var sca = 1 + 5 * t;

      this.el.setAttribute('scale', {x: sca, y: sca, z: sca});
      this.el.getObject3D('mesh').material.transparent = true;
      this.el.getObject3D('mesh').material.opacity = 1 - t0;
      if (t0 > 1) { this.resetBullet(); }
      return;
    }

    var position = new THREE.Vector3(pos.x, pos.y, pos.z);
    var length = position.length();

    // Lost in the sky
    if (length >= 80) {
      this.resetBullet();
    }

    if (length >= 15) {
      // To detect out of space
      /*
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
*/
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
