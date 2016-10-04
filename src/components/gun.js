/* global AFRAME THREE */

// Weapon definitions.
var WEAPONS = {
  default: {
    model: {
      url: 'url(models/gun.json)',
      positionOffset: [0, 0, 0],
      rotationOffset: [0, 0, 0],
    },
    shootSound: 'url(sounds/gun0.ogg)',
    shootingDelay: 100, // In ms
    bullet: 'default'
  }
};

/**
 * Tracked controls, gun model, firing animation, shooting effects.
 */
AFRAME.registerComponent('weapon', {
  dependencies: ['shoot-controls'],

  schema: {
    enabled: { default: true },
    type: { default: 'default' }
  },

  init: function () {
    var el = this.el;
    var self = this;

    this.model = null;
    this.weapon = WEAPONS[ this.data.type ];

    el.setAttribute('json-model', {src: this.weapon.model.url});

    el.setAttribute('sound__shoot', {
      src: this.weapon.shootSound,
      on: 'shoot',
      volume: 0.0,
      poolSize: 10
    });

    this.fire = null;
    el.addEventListener('model-loaded', function (evt) {
      this.model = evt.detail.model;
      var modelWithPivot = new THREE.Group();
      modelWithPivot.add(this.model);
      el.setObject3D('mesh', modelWithPivot);

      evt.detail.model.position.set(0,-0.1,0);
      modelWithPivot.rotation.x = -1.2;
      var pivot = new THREE.Group();

      for (var i = 0; i < this.model.children.length; i++) {
        if (this.model.children[i].name === 'fire') {
          this.model.children[i].visible = false;
          this.fire = this.model.children[i];
          break;
        }
      }
    }.bind(this));

    this.lightIntensity = 0.1;
    this.life = this.data.lifespan;
    this.canShoot = true;

    this.light = document.createElement('a-entity');
    el.appendChild(this.light);

    this.light.setAttribute('light', {color: '#ff0', intensity: 0.0, type: 'point'});
    this.light.setAttribute('position', {x: 0, y: -0.1, z: -0.2});
  },

  tick: function (time, delta) {
    var light = this.light.getAttribute('light');
    if (light.intensity > 0.0) {
      light.intensity -= delta / 1000;
      if (light.intensity < 0.0) {
        light.intensity = 0.0;
      }

      this.light.setAttribute('light', light);

      var t = light.intensity / this.lightIntensity;
      if (this.fire) {
        this.fire.material.opacity = Math.sin(t * t);
        this.fire.material.transparent = true;
      }
    } else {
      if (this.fire) {
        this.fire.visible = false;
      }
    }
  },

  update: function () {
    var data = this.data;
    this.weapon = WEAPONS[ data.type ];
  }
});


/**
 * Spawn bullets on an event.
 * Default schema optimized for Vive controllers.
 */
AFRAME.registerComponent('shoot', {
  schema: {
    direction: {type: 'vec3', default: {x: 0, y: -2, z: -1}},  // Event to fire bullet.
    on: {default: 'triggerdown'},  // Event to fire bullet.
    spaceKeyEnabled: {default: false},  // Keyboard support.
    weapon: {default: 'default'}  // Weapon definition.
  },

  init: function () {
    var data = this.data;
    var el = this.el;
    var self = this;

    this.coolingDown = false;  // Limit fire rate.
    this.shoot = this.shoot.bind(this);
    this.weapon = null;

    // Add event listener.
    if (data.on) { el.addEventListener(data.on, this.shoot); }

    // Add keyboard listener.
    if (data.spaceKeyEnabled) {
      window.addEventListener('keydown', function (evt) {
        if (evt.code === 'Space' || evt.keyCode === '32') { self.shoot(); }
      });
    }
  },

  update: function (oldData) {
    // Update weapon.
    this.weapon = WEAPONS[this.data.weapon];
  },

  shoot: (function () {
    var direction = new THREE.Vector3();
    var position = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    var translation = new THREE.Vector3();

    return function () {
      var bulletEntity;
      var el = this.el;
      var data = this.data;
      var inc;
      var matrixWorld;
      var self = this;
      var weapon = this.weapon;

      if (this.coolingDown) { return; }

      // Get firing entity's transformations.
      matrixWorld = el.object3D.matrixWorld;
      position.setFromMatrixPosition(matrixWorld);
      matrixWorld.decompose(translation, quaternion, scale);

      /*
        var light = this.light.getAttribute('light');
        light.intensity = this.lightIntensity;
        this.light.setAttribute('light', light);
      */

      // Set projectile direction.
      direction.set(data.direction.x, data.direction.y, data.direction.z);
      direction.applyQuaternion(quaternion);
      direction.normalize();

      inc = new THREE.Vector3(0.0, -0.4, -0.1);
      inc.applyQuaternion(quaternion);
      position.add(inc);

      // Ask system for bullet and set bullet position to starting point.
      bulletEntity = el.sceneEl.systems.bullet.getBullet(weapon.bullet);
      bulletEntity.setAttribute('position', position);
      bulletEntity.setAttribute('bullet', {
        direction: direction,
        position: position,
        owner: 'player'
      });
      bulletEntity.setAttribute('visible', true);
      bulletEntity.setAttribute('position', position);

      // Communicate the shoot.
      el.emit('shoot', bulletEntity);

      // Set cooldown period.
      this.coolingDown = true;
      setTimeout(function () {
        self.coolingDown = false;
      }, weapon.shootingDelay);
    };
  })()
});
