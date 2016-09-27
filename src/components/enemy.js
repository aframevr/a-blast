/* global AFRAME THREE TWEEN warn */

AFRAME.registerSystem('enemy', {
  init: function () {
    this.enemies = [];
    document.querySelector('a-scene').addEventListener('game-over', function () {
      // console.log('Enemyessss gameover');
    });
    console.log(this);
    this.createNewEnemy();
    this.createNewEnemy();
    this.createNewEnemy();
  },
  tick: function (time, delta) {
  },
  createNewEnemy: function () {
    var entity = document.createElement('a-entity');
    var radius = 13;
    var angle = Math.random() * Math.PI * 2;
    var dist = radius * Math.sqrt(Math.random());
    var point = [ dist * Math.cos(angle),
                  dist * Math.sin(angle),
                  Math.sqrt(radius * radius - dist * dist)];
    if (point[1] < 0) {
      // point[1] = -point[1];
    }

    var game = this.sceneEl.getAttribute('game');
    var points = game.points || 0;
    var level = parseInt(points / 10, 10);
    var waitingTime = 5000 - (Math.random() * 2 + level) * 500;
    if (waitingTime < 2000) {
      waitingTime = 2000;
    }

    // Easy
    var bulletSpeed = 6 + Math.random() * level * 0.5;
    if (bulletSpeed > 8) {
      bulletSpeed = 8;
    }

    var chargingDuration = 6000 - level * 500;
    if (chargingDuration < 4000) {
      chargingDuration = 4000;
    }

    entity.setAttribute('enemy', {
      lifespan: 6 * (Math.random()) + 1,
      waitingTime: waitingTime,
      startPosition: {x: point[0], y: -10, z: point[2]},
      endPosition: {x: point[0], y: point[1], z: point[2]},
      chargingDuration: chargingDuration,
      bulletSpeed: bulletSpeed
    });

    this.sceneEl.appendChild(entity);

    // this.enemies.push(entity);

    entity.setAttribute('position', {x: point[0], y: -10, z: point[2]});
    // entity.setAttribute('geometry', {primitive: 'icosahedron', radius: 1, detail: 1});
    // entity.setAttribute('obj-model', {obj: 'url(mydroid2.obj)', mtl: 'url(mydroid2.mtl)'});
    entity.setAttribute('obj-model', {obj: '#droid-obj', mtl: '#droid-mtl'});

    // entity.setAttribute('material', {shader: 'standard', color: '#ff9', transparent: 'true', opacity: 0.5, flatShading: true});
    entity.setAttribute('material', {shader: 'standard', color: '#ff9', transparent: 'true', opacity: 1.0, flatShading: true});

    // console.log(document.getElementById('droid').object3D.children[0]);
    // entity.el.object3D = document.getElementById('droid').getObject3D('mesh');
  }
});

AFRAME.registerComponent('enemy', {
  schema: {
    active: { default: true },
    lifespan: {default: ''},
    waitingTime: {default: ''},
    startPosition: {default: ''},
    endPosition: {default: ''},
    bulletSpeed: {default: ''},
    chargingDuration: {default: ''}
  },

  deactivate: function () {
    this.active = false;
    this.visible = false;
  },
  activate: function () {
    this.active = true;
    this.visible = true;
  },
  init: function () {
    this.state = 'appearing';
    this.system.enemies.push(this);
    this.life = this.data.lifespan;
    this.waitingTime = this.data.waitingTime;
    this.alive = true;
    this.chargingDuration = this.data.chargingDuration;

    this.exploding = false;
    this.el.addEventListener('hit', this.collided.bind(this));
    // @todo Maybe we could send the time in init?
    this.statusChangeTime = this.time = this.el.sceneEl.time;
/*
    this.soundExplosion = document.createElement('a-entity');
    this.soundExplosion.setAttribute('sound', {
      src: 'sounds/explosion0.ogg',
      on: 'enemy-hit',
      volume: 0.15
    });
    this.soundExplosion.addEventListener('loaded', function () {
      this.el.emit('appearing');
    }.bind(this));
    this.el.appendChild(this.soundExplosion);

    this.soundCharging = document.createElement('a-entity');
    this.soundCharging.setAttribute('sound', {
      src: 'sounds/whoosh0.ogg',
      on: 'charging',
      off: 'shooting',
      volume: 0.1
    });
    this.el.appendChild(this.soundCharging);

    this.soundShooting = document.createElement('a-entity');
    this.soundShooting.setAttribute('sound', {
      src: 'sounds/laser0.ogg',
      on: 'shooting',
      volume: 0.15
    });
    this.el.appendChild(this.soundShooting);
    this.soundAppearing = document.createElement('a-entity');
    this.soundAppearing.setAttribute('sound', {
      src: 'sounds/robots0.ogg',
      on: 'appearing',
      volume: 0.4
    });
    this.soundAppearing.addEventListener('loaded', function () {
      this.el.emit('appearing');
    }.bind(this));
*/
  },
  collided: function () {
    if (this.exploding) {
      return;
    }

    this.el.emit('enemy-hit');
    // this.soundExplosion.emit('enemy-hit');

    this.shoot();
    // var mesh = this.el.getObject3D('mesh');
    // mesh.material.color.setHex(0xff0000);
    // this.explodingTime = this.el.sceneEl.time;
    var children = this.el.getObject3D('mesh').children;
    for (var i = 0; i < children.length; i++) {
      // children[i].explodingDirection = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
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
    this.removeAll();
    this.system.createNewEnemy();
  },

  shoot: function (time) {
    // this.soundCharging.emit('shooting');
    // this.soundShooting.emit('shooting');
    // console.info('shooting');
    this.statusChangeTime = time;

    var entity = document.createElement('a-entity');
    var direction = this.el.object3D.position.clone();
    var head = this.el.sceneEl.camera.el.components['look-controls'].dolly.position.clone();
    direction = head.sub(direction).normalize();

    entity.setAttribute('enemybullet', {direction: direction, position: this.el.object3D.position, speed: this.data.bulletSpeed});
    entity.setAttribute('position', this.el.object3D.position);
    entity.setAttribute('geometry', {primitive: 'icosahedron', radius: 0.08, detail: 0});
    entity.setAttribute('material', {shader: 'standard', flatShading: true, color: '#f00'});
    this.el.sceneEl.appendChild(entity);
  },
  removeAll: function () {
    var index = this.system.enemies.indexOf(this);
    this.system.enemies.splice(index, 1);
    this.el.parentElement.removeChild(this.el);
  },
  charge: function (time) {
    // console.log('charging');
    this.statusChangeTime = time;
    this.state = 'charging';
    // this.soundCharging.emit('charging');
  },
  tick: function (time, delta) {
    var game = document.querySelector('a-scene').getAttribute('game');
    if (game && game.state === 'game-over') {
      return;
    }

    // if (!this.alive || !this.active) {
    if (!this.alive) {
      return;
    }
    var statusTimeOffset = time - this.statusChangeTime;

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

    // var timeOffset = time - this.time;

    // console.log(this.state, time.toFixed(2), statusTimeOffset.toFixed(2));

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
        /*
        offset = offset;
        var sca = this.currentScale * (1-offset);
        if (sca < 1.0) {
          sca= 1.0;
        }
        */
        sca = 1;

        this.el.setAttribute('scale', {x: sca, y: sca, z: sca});

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

    // Make the droid to look the headset
    var head = this.el.sceneEl.camera.el.components['look-controls'].dolly.position.clone();
    this.el.object3D.lookAt(head);
  },

  update: function () {
  },

  remove: function () {
    // if (!this.model) { return; }
    // this.el.removeObject3D('mesh');
  }
});
