var WEAPONS = require('./weapon');

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
/*
    if (AFRAME.utils.device.isMobile())
    {
      window.addEventListener('click', function (evt) {
        self.shoot();
      });
    }
*/
  },

  update: function (oldData) {
    // Update weapon.
    this.weapon = WEAPONS[this.data.weapon];

    if (oldData.on !== this.data.on) {
      this.el.removeEventListener(oldData.on, this.shoot);
      this.el.addEventListener(this.data.on, this.shoot);
    }
  },

  shoot: (function () {
    var direction = new THREE.Vector3();
    var position = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    var translation = new THREE.Vector3();
    var incVive = new THREE.Vector3(0.0, -0.23, -0.15);
    var incOculus = new THREE.Vector3(0, -0.23, -0.8);
    var inc = new THREE.Vector3();

    return function () {
      var bulletEntity;
      var el = this.el;
      var data = this.data;
      var matrixWorld;
      var self = this;
      var weapon = this.weapon;

      if (this.coolingDown) { return; }

      ABLAST.currentScore.shoots++;

      // Get firing entity's transformations.
      el.object3D.updateMatrixWorld();
      matrixWorld = el.object3D.matrixWorld;
      position.setFromMatrixPosition(matrixWorld);
      matrixWorld.decompose(translation, quaternion, scale);

      // Set projectile direction.
      direction.set(data.direction.x, data.direction.y, data.direction.z);
      direction.applyQuaternion(quaternion);
      direction.normalize();

      if (el.components['weapon']) {
        inc.copy(el.components.weapon.controllerModel === 'oculus-touch-controller' ? incOculus : incVive);
      }
      inc.applyQuaternion(quaternion);
      position.add(inc);

      // Ask system for bullet and set bullet position to starting point.
      bulletEntity = el.sceneEl.systems.bullet.getBullet(weapon.bullet);
      bulletEntity.setAttribute('position', position);
      bulletEntity.setAttribute('bullet', {
        direction: direction.clone(),
        position: position.clone(),
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
