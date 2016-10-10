AFRAME.registerComponent('enemy', {
  schema: {
    name: { default: 'enemy0' },
    bulletName: { default: 'enemy'},
    shootingDelay: { default: 2000 }, // ms
  },
  init: function () {
    this.alive = true;
    this.definition = ASHOOTER.ENEMIES[this.data.name].definition;
    this.definition.init.call(this);

    this.exploding = false;
    this.el.addEventListener('hit', this.collided.bind(this));
    // @todo Maybe we could send the time in init?
  },
  update: function (oldData) {
  },
  play: function () {
    var self = this;
    this.shootInterval = setInterval(function() {
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
    var children = this.el.getObject3D('mesh').children;
    for (var i = 0; i < children.length; i++) {
      children[i].explodingDirection = new THREE.Vector3(
        2 * Math.random() - 1,
        2 * Math.random() - 1,
        2 * Math.random() - 1);
      children[i].startPosition = children[i].position.clone();
      children[i].endPosition = children[i].position.clone().add(children[i].explodingDirection.clone().multiplyScalar(3));
    }
    this.exploding = true;

    this.system.activeEnemies.splice(this.system.activeEnemies.indexOf(this.el), 1);
  },

  die: function () {
    this.alive = false;
    this.reset();
    this.system.onEnemyDies(this.data.name, this.el);
  },

  reset: function () {
    clearInterval(this.shootInterval);
    var self = this;
    this.alive = true;
    this.exploding = false;
    this.definition.reset.call(this);
  },

  shoot: function () {
    var el = this.el;
    var data = this.data;
    var position = el.getAttribute('position');
    var head = el.sceneEl.camera.el.components['look-controls'].dolly.position.clone();
    var direction = head.sub(el.object3D.position.clone()).normalize();

    // Ask system for bullet and set bullet position to starting point.
    var bulletEntity = el.sceneEl.systems.bullet.getBullet(data.bulletName);
    bulletEntity.setAttribute('position', position);
    bulletEntity.setAttribute('bullet', {
      direction: direction,
      position: position,
      owner: 'enemy'
    });
    bulletEntity.setAttribute('visible', true);
    bulletEntity.play();

    var self = this;
  },
  tick: function (time, delta) {
    if (!this.alive) {
      return;
    }

    this.definition.tick.call(this, time, delta);

    if (this.exploding) {
      this.die();
      return;
      if (!this.explodingTime) {
        this.explodingTime = time;
      }
      var duration = 3000;
      var t0 = (time - this.explodingTime) / duration;
      var children = this.el.getObject3D('mesh').children;
      var t = TWEEN.Easing.Exponential.Out(t0);

      for (var i = 0; i < children.length; i++) {
        var pos = children[i].startPosition.clone();
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
    }

    // Make the droid to look the headset
    var head = this.el.sceneEl.camera.el.components['look-controls'].dolly.position.clone();
    this.el.object3D.lookAt(head);
  }
});
