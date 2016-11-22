/* globals AFRAME ASHOOTER THREE */
AFRAME.registerComponent('enemy', {
  schema: {
    name: {default: 'enemy0'},
    bulletName: {default: 'enemy-slow'},
    shootingDelay: {default: 200} // ms
  },
  init: function () {
    this.alive = true;
    this.gunOffset = new THREE.Vector3(0.0, 0.44, 0.5);
    this.hipBone = null;
    this.definition = ASHOOTER.ENEMIES[this.data.name].definition;
    this.definition.init.call(this);
    this.lastShootTime = undefined;
    this.paused = false;

    var self = this;
    this.el.addEventListener('model-loaded', function(event) {
        self.el.components['json-model'].playAnimation('fly', true);
        self.hipBone = self.el.object3D.children[3].children[0];
    });


    // gun glow
    this.gunGlowMaterial = new THREE.MeshBasicMaterial({
      color: {'enemy-slow': '#F00', 'enemy-fat':'#F70', 'enemy-fast': '#FFBE34'}[this.data.bulletName],
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      visible: false
    });
    var src = document.querySelector('#fx3').getAttribute('src');
    this.el.sceneEl.systems.material.loadTexture(src, {src: src}, setMap.bind(this));

    function setMap (texture) {
      this.gunGlowMaterial.alphaMap = texture;
      this.gunGlowMaterial.needsUpdate = true;
      this.gunGlowMaterial.visible = true;
    }
    this.gunGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.gunGlowMaterial);
    this.gunGlow.position.copy(this.gunOffset);
    this.gunGlow.rotation.set(0.0, 0.0, 0.0);
    this.el.setObject3D('glow', this.gunGlow);

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
    this.paused = false;
  },
  pause: function () {
    this.paused = true;
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
    
    var mesh = this.el.getObject3D('mesh');
    this.whiteMaterial = new THREE.MeshBasicMaterial({color: 16777215, transparent: true });
    mesh.normalMaterial = mesh.material;
    mesh.material = this.whiteMaterial;

    this.gunGlow.visible = false;

    this.system.activeEnemies.splice(this.system.activeEnemies.indexOf(this.el), 1);
  },

  die: function () {
    this.alive = false;
    this.reset();
    this.system.onEnemyDeath(this.data.name, this.el);
  },

  reset: function () {
    //if it has exploded before, reset explosion properties
    /*if (this.el.hasAttribute('explosion')) {
      var mesh = this.el.getObject3D('mesh');
      mesh.material.opacity = 1;
      this.el.removeObject3D('explosion');
      this.el.removeAttribute('explosion');
      mesh.scale.set(1, 1, 1);
      this.el.setAttribute('scale', '1 1 1');
      mesh.material = mesh.normalMaterial;
    }*/
    var mesh = this.el.getObject3D('mesh');
    if (mesh) {
      mesh.material.opacity = 1;
      mesh.scale.set(1, 1, 1);
      mesh.material = mesh.normalMaterial;
      this.gunGlow.visible = true;
      this.gunGlow.scale.set(1, 1, 1);
      this.gunGlowMaterial.opacity = 0.3;
    }
    
    this.el.setAttribute('scale', '1 1 1');
    this.explodingTime = undefined;  
    this.lastShootTime = undefined;

    this.alive = true;
    this.exploding = false;
    this.definition.reset.call(this);
  },

  shoot: function () {
    var el = this.el;
    var data = this.data;
    var position = el.object3D.position.clone().add(this.gunOffset);
    if (this.hipBone) {
      //position.y += this.hipBone.position.y;
    }
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
    if (!this.alive || this.paused) {
      return;
    }
    if (this.lastShootTime === undefined) {
      this.lastShootTime = time;
    }
    else {
      var elapsedShootTime = time - this.lastShootTime;
      if (elapsedShootTime > this.data.shootingDelay) {
        this.lastShootTime = time;
        this.gunGlow.scale.set(1, 1, 1);
        this.gunGlowMaterial.opacity = 0.3;
        this.shoot();
      }
      else if (this.data.shootingDelay - elapsedShootTime < 1000) {
        this.gunGlowMaterial.opacity = elapsedShootTime / this.data.shootingDelay;
      }
    }

    if (!this.exploding) {
      var glowScale = 1.0 + Math.abs(Math.sin(time/50));
      this.gunGlow.scale.set(glowScale, glowScale, glowScale);
      this.gunGlow.position.copy(this.gunOffset);
      if (this.hipBone) {
        this.gunGlow.position.y += this.hipBone.position.y;
      }
      // Make the droid to look the headset
      var head = this.el.sceneEl.camera.el.components['look-controls'].dolly.position.clone();
      this.el.object3D.lookAt(head);

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

  }
});
