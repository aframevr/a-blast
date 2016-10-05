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

    var self = this;
    setTimeout(function() {
      self.shoot();
    }, this.data.shootingDelay);
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
  },

  die: function () {
    this.alive = false;
    this.reset();
    this.system.onEnemyDies(this.data.name, this.el);
  },

  reset: function () {
    this.alive = true;
    this.exploding = false;
    this.definition.reset.call(this);
  },

  shoot: function () {
    var el = this.el;
    var data = this.data;

    var position = el.object3D.position;
    var head = el.sceneEl.camera.el.components['look-controls'].dolly.position.clone();
    var direction = head.sub(el.object3D.position.clone()).normalize();

    // Ask system for bullet and set bullet position to starting point.
/*
    var bulletEntity = el.sceneEl.systems.bullet.getBullet(data.bulletName);
    bulletEntity.setAttribute('position', this.el.object3D.position);
    bulletEntity.setAttribute('bullet', {
      direction: direction,
      position: position,
      owner: 'enemy'
    });
    bulletEntity.setAttribute('visible', true);
    bulletEntity.setAttribute('position', position);
*/
    var self = this;
    setTimeout(function() {
      self.shoot();
    }, this.data.shootingDelay);
  },
  tick: function (time, delta) {
    if (!this.alive) {
      return;
    }

    if (this.exploding) {
      if (!this.explodingTime) {
        this.explodingTime = time;
      }
      var duration = 3000;
      var t0 = (time - this.explodingTime) / duration;
      var children = this.el.getObject3D('mesh').children;
      var t = TWEEN.Easing.Exponential.Out(t0);

      for (var i = 0; i < children.length; i++) {
        // t = TWEEN.Easing.Exponential.Out(t);
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

/*
    if (this.state === 'appearing') {
      duration = 2000;
      t = statusTimeOffset / duration;
      pos = new THREE.Vector3(this.data.startPosition.x, this.data.startPosition.y, this.data.startPosition.z);
      t = TWEEN.Easing.Back.Out(t);
      pos.lerp(this.data.endPosition, t);
      this.el.setAttribute('position', pos);

      if (statusTimeOffset >= duration) {
        this.charge(time);
      }
    } else if (this.state === 'charging') {
      var offset = statusTimeOffset / this.chargingDuration;
      var sca = offset / 2 + 1 + Math.random() * 0.1;
      this.el.setAttribute('scale', {x: sca, y: sca, z: sca});
      if (statusTimeOffset >= this.chargingDuration) {
        this.state = 'shooting';
        // this.el.setAttribute('scale', {x: 1, y: 1, z: 1});
        this.currentScale = sca;

        this.shootingBackPosition = new THREE.Vector3(
          this.data.endPosition.x,
          this.data.endPosition.y,
          this.data.endPosition.z)
          .multiplyScalar(1.1);

        this.shoot(time);
      }
    } else if (this.state === 'shooting') {
      var shootingAnimationDuration = 1000;
      offset = statusTimeOffset / shootingAnimationDuration;
      if (offset <= 1.0) {
        this.el.setAttribute('scale', '1 1 1');

        offset = TWEEN.Easing.Exponential.Out(offset);
        pos = this.shootingBackPosition.clone();
        offset = Math.sin(offset * Math.PI);
        offset = 1 - offset;
        pos.lerp(this.data.endPosition, offset);
        this.el.setAttribute('position', pos);
      }

      if (this.waitingTime > 0) {
        this.waitingTime -= delta;
        if (this.waitingTime <= 0) {
          this.charge(time);
          this.waitingTime = this.data.waitingTime;
        }
      }
    }
*/
    // Make the droid to look the headset
    var head = this.el.sceneEl.camera.el.components['look-controls'].dolly.position.clone();
    this.el.object3D.lookAt(head);
  }
});
