var GUNS = {
  default: {
    model: {
      url: 'url(models/gun.json)',
      positionOffset: [0, 0, 0],
      rotationOffset: [0, 0, 0],
    },
    shootSound: 'url(sounds/gun0.ogg)',
    shootingDelay: 20, // In ms
    bullet: {
      speed: 10,
      acceleration: 5
    }
  }
};

/* global AFRAME THREE */
AFRAME.registerComponent('gun', {
  dependencies: ['shoot-controls'],
  schema: {
    enabled: { default: true },
    type: { default: 'default' }
  },

  init: function () {
    var el = this.el;
    var self = this;

    this.model = null;
    this.gun = GUNS[ this.data.type ];

    el.setAttribute('json-model', {src: this.gun.model.url});

    this.el.setAttribute('sound__shoot', {
      src: this.gun.shootSound,
      on: 'shoot',
      volume: 0.2,
      poolSize: 10
    });

    this.fire = null;
    this.el.addEventListener('model-loaded', function (evt) {
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

    this.el.addEventListener('triggerdown', function (evt) {
      if (!self.data.enabled) { return; }
      self.shoot();
    });

    this.lightIntensity = 0.1;
    this.life = this.data.lifespan;
    this.canShoot = true;

    this.light = document.createElement('a-entity');
    this.el.appendChild(this.light);

    this.light.setAttribute('light', {color: '#ff0', intensity: 0.0, type: 'point'});
    //this.light.setAttribute('geometry', {primitive: 'icosahedron', detail: 0, radius:0.05});
    this.light.setAttribute('position', {x: 0, y: -0.1, z: -0.2});
  },

  play: function () {
  },

  pause: function () {
  },

  onModelLoaded: function (evt) {
    // var controllerObject3D = evt.detail.model;
  },

  shoot: function () {
    if (this.canShoot) {
      var el = this.el;
      var matrixWorld = el.object3D.matrixWorld;
      var position = new THREE.Vector3();
      var direction = new THREE.Vector3();
      position.setFromMatrixPosition(matrixWorld);

      var light = this.light.getAttribute('light');
      light.intensity = this.lightIntensity;
      this.light.setAttribute('light', light);

      var quaternion = new THREE.Quaternion();
      var translation = new THREE.Vector3();
      var scale = new THREE.Vector3();
      matrixWorld.decompose(translation, quaternion, scale);

      direction.set(0, -2.0, -1);
      direction.applyQuaternion(quaternion);
      direction.normalize();

      //var inc = new THREE.Vector3(0.0, -0.03, -0.1);
      var inc = new THREE.Vector3(0.0, -0.4, -0.1);
      inc.applyQuaternion(quaternion);
      position.add(inc);

      var bullet = this.gun.bullet;

      var bulletEntity = el.sceneEl.systems.bullet.getBullet('default', {
        direction: direction,
        position: position
      });
      bulletEntity.setAttribute('position', position);

//      bulletEntity.setAttribute('position', position);
/*      bulletEntity.setAttribute('bullet', {
        speed: bullet.speed,
        acceleration: bullet.acceleration
      });
*/
      this.el.emit('shoot', bulletEntity);
      this.canShoot = false;
      setTimeout(function () {this.canShoot = true;}.bind(this), this.gun.shootingDelay);
    }
  },

  tick: function (time, delta) {
    // console.log(this.el.getObject3D('mesh'));

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
        // this.fire.position.copy(this.fire.parent.parent.position);
        // this.fire.applyMatrix( new THREE.Matrix4().setTranslation( 0, 10, 0 ) );
        // this.fire.applyMatrix( new THREE.Matrix4().makeScale( t,t,t ) );
        // console.log(this.fire.position, this.fire.parent.parent.position);
        // this.fire.scale.set(t,t,t);
      }
    } else {
      if (this.fire) {
        this.fire.visible = false;
      }
    }
  },

  update: function () {
    var data = this.data;
    var el = this.el;
    this.gun = GUNS[ data.type ];
  }

});
