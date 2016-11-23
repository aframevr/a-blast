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
    this.shootAt = 0;
    this.warmUpTime = 1000;
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
    this.shootAt = 0;
    this.warmUpTime = 1000;

    this.alive = true;
    this.exploding = false;
    this.definition.reset.call(this);
  },

  shoot: function (time, delta) {
    var el = this.el;
    if (!el) return;
    var data = this.data;
    var scale = el.getAttribute('scale');
    var mesh = el.object3D;
    var gunPosition = mesh.localToWorld(this.gunGlow.position.clone());
    var head = el.sceneEl.camera.el.components['look-controls'].dolly.position.clone();
    var direction = head.sub(mesh.position).normalize();

    this.lastShootTime = time;

    this.gunGlow.scale.set(3, 3, 3);
    this.gunGlowMaterial.opacity = 1;

    var explosion = document.createElement('a-entity');
    explosion.setAttribute('position', gunPosition);
    explosion.setAttribute('scale', scale);
    explosion.setAttribute('explosion', 'type: enemygun; color: #'+this.gunGlowMaterial.color.getHexString()+'; lookAt:' + direction.x+' '+direction.y+' '+direction.z);
    this.el.sceneEl.appendChild(explosion);

    // Ask system for bullet and set bullet position to starting point.
    var bulletEntity = el.sceneEl.systems.bullet.getBullet(data.bulletName);
    bulletEntity.setAttribute('bullet', {
      position: gunPosition,
      direction: direction,
      owner: 'enemy'
    });
    bulletEntity.setAttribute('position', gunPosition);
    bulletEntity.setAttribute('visible', true);
    bulletEntity.play();
  },

  willShoot: function (time, delta, warmUpTime) {
    this.shootAt = time + warmUpTime; 
    this.warmUpTime = warmUpTime;
  },

  tick: function (time, delta) {
    if (!this.alive || this.paused) {
      return;
    }

    if (!this.exploding) {
      //gun glow
      var glowFadeOutTime = 700;
      if (this.lastShootTime === undefined) {
        this.lastShootTime = time;
      }
      else {
        if (this.shootAt - time < this.warmUpTime) {
          this.gunGlowMaterial.opacity = (this.shootAt - time) / this.warmUpTime;
          var glowScale = 1.0 + Math.abs(Math.sin(time / 50));
          this.gunGlow.scale.set(glowScale, glowScale, glowScale);
        }
        else if (time - this.lastShootTime < glowFadeOutTime) {
          this.gunGlowMaterial.opacity = 1 - (time - this.lastShootTime) / glowFadeOutTime;
        }
      }
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
    }

  }
});
