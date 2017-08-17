// Weapon definitions.
var WEAPONS = {
  default: {
    model: {
      url: 'url(assets/models/gun.json)',
      positionOffset: [0, 0, 0],
      rotationOffset: [0, 0, 0]
    },
    shootSound: 'url(assets/sounds/gun.ogg)',
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

  updateWeapon: function () {
    console.log(this.controllerModel);
    if (this.controllerModel === 'oculus-touch-controller') {
      this.model.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), 0.8));
      this.el.setAttribute('shoot', {direction: '0 -0.3 -1'});
    } else if (this.controllerModel === 'daydream-controls') {
      document.getElementById('rightHandPivot').setAttribute('position', '-0.2 0 -0.5');
      this.el.setAttribute('shoot', {on: 'trackpaddown'});
    }
  },
  init: function () {
    var el = this.el;
    var self = this;

    this.model = null;
    this.isGamepadConnected = false;
    this.controllerModel = null;
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

    el.addEventListener('controllerconnected', function (evt) {
      console.log(evt);
      self.controllerModel = evt.detail.name;
      if (self.model == null) {
        self.isGamepadConnected = true;
      } else {
        self.updateWeapon();
      }
    });

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

      if (this.isGamepadConnected) {
        this.updateWeapon();
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
    var self = this;
    this.light.addEventListener('loaded', function () {
      self.lightObj = self.light.components.light.light; // threejs light
    })
  },

  tick: function (time, delta) {
    if (this.lightObj && this.lightObj.intensity > 0.0) {
      this.light.visible = true;
      this.lightObj.intensity -= delta / 1000 * 10;
      if (this.lightObj.intensity < 0.0) {
        this.lightObj.intensity = 0.0;
        this.light.visible = false;
      }
      for (var i in this.fires) {
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

module.exports = WEAPONS;
