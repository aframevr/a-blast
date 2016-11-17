/* globals AFRAME ASHOOTER THREE */
AFRAME.registerComponent('enemy', {
  schema: {
    name: {default: 'enemy0'},
    bulletName: {default: 'enemy-slow'},
    shootingDelay: {default: 200} // ms
  },
  init: function () {
    this.alive = true;
    this.definition = ASHOOTER.ENEMIES[this.data.name].definition;
    this.definition.init.call(this);

    var self = this;
    this.el.addEventListener('model-loaded', function(event) {
        self.el.components['json-model'].playAnimation('fly', true);
    });

    this.exploding = false;
    this.explodingDuration = 500 + Math.floor(Math.random()*300);
    this.el.addEventListener('hit', this.collided.bind(this));

    this.sounds = [
      document.getElementById('explosion0'),
      document.getElementById('explosion1'),
      document.getElementById('explosion2')
    ];
    // @todo Maybe we could send the time in init?
  },
  update: function (oldData) {
  },
  play: function () {
    var self = this;
    this.shootInterval = setInterval(function () {
      self.shoot();
    }, this.data.shootingDelay);
  },
  pause: function () {
    clearInterval(this.shootInterval);
  },
  collided: function () {
    if (this.exploding) {
      return;
    }

    this.el.emit('enemy-hit');

    // this.shoot(); // Add as a parameter to shoot back when dead

    /*
    var children = this.el.getObject3D('mesh').children;
    for (var i = 0; i < children.length; i++) {
      children[i].explodingDirection = new THREE.Vector3(
        2 * Math.random() - 1,
        2 * Math.random() - 1,
        2 * Math.random() - 1);
      children[i].startPosition = children[i].position.clone();
      children[i].endPosition = children[i].position.clone().add(children[i].explodingDirection.clone().multiplyScalar(3));
    }
    */
    this.exploding = true;
    this.el.setAttribute('explosion','duration: ' + this.explodingDuration+ '; color: #4dd3ff');

    // Play sound
    this.sounds[Math.floor(Math.random()*3)].play();

    var mesh = this.el.getObject3D('mesh');
    this.whiteMaterial = new THREE.MeshBasicMaterial({color: 16777215, transparent: true });
    mesh.normalMaterial = mesh.material;
    mesh.material = this.whiteMaterial;

    this.system.activeEnemies.splice(this.system.activeEnemies.indexOf(this.el), 1);
  },

  die: function () {
    this.alive = false;
    this.reset();
    this.system.onEnemyDeath(this.data.name, this.el);
  },

  reset: function () {
    //if it has exploded before, reset explosion properties
    if (this.el.hasAttribute('explosion')) {
      var mesh = this.el.getObject3D('mesh');
      mesh.material.opacity = 1;
      this.el.removeObject3D('explosion');
      this.el.removeAttribute('explosion');
      mesh.scale.set(1, 1, 1);
      this.el.setAttribute('scale', '1 1 1');
      mesh.material = mesh.normalMaterial;
    }

    this.explodingTime = null;

    clearInterval(this.shootInterval);
    this.alive = true;
    this.exploding = false;
    this.definition.reset.call(this);
  },

  shoot: function () {
    var el = this.el;
    var data = this.data;
    var position = el.object3D.position.clone(); // el.getAttribute('position');
    var head = el.sceneEl.camera.el.components['look-controls'].dolly.position.clone();
    var direction = head.sub(el.object3D.position).normalize();

    // Ask system for bullet and set bullet position to starting point.
    var bulletEntity = el.sceneEl.systems.bullet.getBullet(data.bulletName);
    bulletEntity.setAttribute('bullet', {
      position: position,
      direction: direction,
      owner: 'enemy'
    });
    bulletEntity.setAttribute('position', position);
    bulletEntity.setAttribute('visible', true);
    bulletEntity.play();
  },
  tick: function (time, delta) {
    if (!this.alive) {
      return;
    }

    if (!this.exploding) {
      this.definition.tick.call(this, time, delta);
    }
    else {
      if (!this.explodingTime) {
        this.explodingTime = time;
      }
      var t0 = (time - this.explodingTime) / this.explodingDuration;

      var scale = 1 + t0 * ( 2 - t0 ); //out easing

      var mesh = this.el.getObject3D('mesh');
      mesh.scale.set(scale, scale, scale);
      mesh.material.opacity = Math.max(0, 1 - t0 * 2.5);
      if (t0 >= 1) {
        this.die();
      }

      return;
/*
      if (!this.explodingTime) {
        this.explodingTime = time;
      }
      var duration = 3000;
      var t0 = (time - this.explodingTime) / duration;
      var children = this.el.getObject3D('mesh').children;
      var t = TWEEN.Easing.Exponential.Out(t0);

      for (var i = 0; i < children.length; i++) {
        children[i].position.copy(children[i].startPosition.clone().lerp(children[i].endPosition, t));
        var dur = 1 - t;
        children[i].scale.set(dur, dur, dur);
        children[i].material.opacity = (1 - t0);
        children[i].material.transparent = true;
      }
      if (t0 >= 1) {
        this.die();
      }
      return;
*/
    }

    // Make the droid to look the headset
    var head = this.el.sceneEl.camera.el.components['look-controls'].dolly.position.clone();
    this.el.object3D.lookAt(head);
  }
});
