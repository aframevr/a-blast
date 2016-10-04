/* global AFRAME THREE*/
AFRAME.BULLETS = {};

String.prototype.capitalizeFirstLetter = function() {
  console.log(this, this.charAt(0).toUpperCase() + this.slice(1));
    return this.charAt(0).toUpperCase() + this.slice(1);
}

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
    this.initializePools();
  },

  initializePools: function () {

    console.log(this.sceneEl);

    /* <a-scene pool__laser="mixin: laser; size: 10" pool__bomb="mixin: bomb; size: 10"></a-scene> */
    for (var name in AFRAME.BULLETS) {
      var definition = AFRAME.BULLETS[name].data;
      this.sceneEl.setAttribute('pool__' + 'bullet' + name.capitalizeFirstLetter(), `size: $(definition.poolSize)`);
    }
  },
/*
  addNewBulletToPool: function (name, definition) {
    var bullet = this.createNewBullet(name, definition);
    this.pool[name].push(bullet);
    return bullet;
  },

  createNewBullet: function (name, definition) {
    var bulletEntity = document.createElement('a-entity');
    bulletEntity.setAttribute('bullet', {
      name: name,
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
    var bullet = this.addNewBulletToPool(name, AFRAME.BULLETS[name].data);
    this.activateBullet(bullet, extraData);
    return bullet;
  }
*/
});

AFRAME.registerComponent('bullet', {
  schema: {
    name: { default: '' },
    direction: { type: 'vec3' },
    maxSpeed: { default: 5.0 },
    position: { type: 'vec3' },
    acceleration: { default: 0.5 },
    active: { default: false },
    owner: { default: 'player', oneOf: ['enemy', 'player']},
  },

  init: function () {
    this.hit = false;
    this.direction = new THREE.Vector3();
    this.bullet = AFRAME.BULLETS[this.data.name];
    this.bullet.definition.init.call(this);
  },

  update: function (oldData) {
    if (!oldData.active && this.data.active) {
      this.hit = false;
    }
    this.direction.set(this.data.direction.x, this.data.direction.y, this.data.direction.z);
    this.currentAcceleration = this.data.acceleration;
    this.speed = 0;
    this.startPosition = this.data.position;
  },

  hitObject: function () {
    this.bullet.definition.onHit.call(this); //
    this.hit = true;
  },

  resetBullet: function () {
    this.el.setAttribute('bullet', 'active', false);
    this.el.setAttribute('material', 'color', '#ff0');
    this.el.setAttribute('scale', {x: 1, y: 1, z: 1});
    this.el.setAttribute('visible', false);
  },

  tick: (function () {
    var position = new THREE.Vector3();

    return function tick (time, delta) {
      if (!this.data.active) { return; }

      position.copy(this.el.getComputedAttribute('position'));
      var length = position.length();

      // Lost in the sky
      if (length >= 80) {
        this.resetBullet();
        return;
      }

      var friction = 0.005 * delta;
      if (this.currentAcceleration > 0) {
        this.currentAcceleration -= friction;
      } else if (this.currentAcceleration <= 0) {
        this.currentAcceleration = 0;
      }
      this.speed += this.currentAcceleration;

      var newBulletPosition = position.add(this.direction.clone().multiplyScalar(this.speed));
      this.el.setAttribute('position', newBulletPosition);

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
    }
  })()
});
