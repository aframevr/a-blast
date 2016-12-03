/* global AFRAME THREE */

// Weapon definitions.
var WEAPONS = {
  default: {
    model: {
      url: 'url(https://feiss.github.io/a-shooter-assets/models/gun.json)',
      positionOffset: [0, 0, 0],
      rotationOffset: [0, 0, 0]
    },
    shootSound: 'url(https://feiss.github.io/a-shooter-assets/sounds/gun.ogg)',
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

    this.model = null;
    this.weapon = WEAPONS[ this.data.type ];

    el.setAttribute('json-model', {src: this.weapon.model.url});

    el.setAttribute('sound', {
      src: this.weapon.shootSound,
      on: 'shoot',
      volume: 0.5,
      poolSize: 10
    });

    this.fires = [];
    this.trigger = null;

    el.addEventListener('model-loaded', function (evt) {
      this.model = evt.detail.model;
      var modelWithPivot = new THREE.Group();
      modelWithPivot.add(this.model);
      el.setObject3D('mesh', modelWithPivot);

      for (var i = 0; i < 3; i++){
        var fire = this.model.getObjectByName('fire'+i);
        if (fire) {
          fire.material.depthWrite = false;
          fire.visible = false;
          this.fires.push(fire);
        }
      }

      this.trigger = this.model.getObjectByName('trigger');

    }.bind(this));

    var self = this;
    el.addEventListener('shoot', function (evt) {
      el.components['json-model'].playAnimation('default');
      self.light.components.light.light.intensity = self.lightIntensity;
      for (var i in self.fires){
        self.fires[i].visible = true;
        self.fires[i].life = 50 + Math.random() * 100;
      }
    });

    this.lightIntensity = 3.0;
    this.life = this.data.lifespan;
    this.canShoot = true;

    this.light = document.createElement('a-entity');
    el.appendChild(this.light);

    this.light.setAttribute('light', {color: '#24CAFF', intensity: 0.0, type: 'point'});
    this.light.setAttribute('position', {x: 0, y: -0.22, z: -0.14});
    this.lightObj = this.light.components.light.light; // threejs light
  },

  tick: function (time, delta) {
    if (this.lightObj && this.lightObj.intensity > 0.0) {
      this.light.visible = true;
      this.lightObj.intensity -= delta / 1000 * 10;
      if (this.lightObj.intensity < 0.0) {
        this.lightObj.intensity = 0.0;
        this.light.visible = false;
      }
      for (var i in this.fires){
        if (!this.fires[i].visible) continue;
        this.fires[i].life -= delta;
        if (i == 0) {
          this.fires[i].rotation.set(0, Math.random() * Math.PI * 2, 0);
        }
        else {
          this.fires[i].rotation.set(0, Math.random() * 1 - 0.5 + (Math.random() > 0.5 ? Math.PI: 0) , 0);
        }
        if (this.fires[i].life < 0){
          this.fires[i].visible = false;
        }
      }
    }
  },

  update: function () {
    var data = this.data;
    this.weapon = WEAPONS[ data.type ];
  },

  setTriggerPressure: function (pressure) {
    if (this.trigger) {
      this.trigger.position.setY(pressure * 0.01814);
    }
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

      ABLAST.currentScore.shoots++;

      // Get firing entity's transformations.
      matrixWorld = el.object3D.matrixWorld;
      position.setFromMatrixPosition(matrixWorld);
      matrixWorld.decompose(translation, quaternion, scale);

      // Set projectile direction.
      direction.set(data.direction.x, data.direction.y, data.direction.z);
      direction.applyQuaternion(quaternion);
      direction.normalize();

      inc = new THREE.Vector3(0.0, -0.23, -0.15);
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
      bulletEntity.play();

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
