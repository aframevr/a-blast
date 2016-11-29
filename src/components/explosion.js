/* globals AFRAME ASHOOTER THREE */

AFRAME.registerComponent('explosion', {
  schema: {
    type: { default: 'enemy', oneOf: ['enemy', 'bullet', 'background', 'enemygun'] },
    duration: { default: 500 },
    color: { type: 'color', default: '#FFFFFF' },
    lookAt: { type: 'vec3', default: null},
    scale: { default: 1 }
  },

  init: function () {
    var self = this;
    this.life = 0;
    this.starttime = null;
    this.meshes = new THREE.Group();

    this.materials = [];
    var textureSrcs = new Array('#fx1', '#fx2', '#fx3', '#fx4', '#fx8');

    var parts;
    switch(this.data.type) {
      case 'enemy':
        parts = [
          {textureIdx: 2, billboard: true,  color: 16777215, scale: 1.5, grow: 4, dispersion: 0, copies: 1, speed: 0 },
          {textureIdx: 0, billboard: true,  color: 16777215, scale: 0.4, grow: 2, dispersion: 2.5, copies: 3, speed: 1 },
          {textureIdx: 3, billboard: false, color: this.data.color, scale: 1, grow: 6, dispersion: 0, copies: 1, speed: 0 },
          {textureIdx: 1, billboard: true,  color: 16577633, scale: 0.04, grow: 2, dispersion: 3, copies: 20, speed: 2},
          {textureIdx: 3, billboard: true,  color: this.data.color, scale: 0.2, grow: 2, dispersion: 2, copies: 10, speed: 1}
        ];
      break;
      case 'bullet':
        this.data.scale = this.data.scale * 0.5;
        parts = [
          {textureIdx: 2, billboard: true,  color: this.data.color, scale: .5, grow: 3, dispersion: 0, copies: 1, speed: 0 },
          {textureIdx: 4, billboard: true,  color: '#24CAFF', scale: .3, grow: 4, dispersion: 0, copies: 1, speed: 0 },
          {textureIdx: 0, billboard: true,  color: this.data.color, scale: 0.04, grow: 2, dispersion: 1.5, copies: 8, speed: 1 }
        ];
      break;
      case 'background':
        this.data.duration = 300;
        parts = [
          {textureIdx: 4, billboard: true,  color: '#24CAFF', scale: .3, grow: 3, dispersion: 0, copies: 1, speed: 0 },
          {textureIdx: 0, billboard: true,  color: '#24CAFF', scale: 0.03, grow: 1, dispersion: 0.3, copies: 8, speed: 1.6, noFade: true }
        ];
      break;
      case 'enemygun':
        this.data.duration = 500;
        parts = [
          {textureIdx: 3, billboard: true,  color: this.data.color, scale: .5, grow: 3, dispersion: 0, copies: 1, speed: 0 },
        ];
      break;
    }

    this.el.setAttribute('scale', {x: this.data.scale, y: this.data.scale, z: this.data.scale });

    for (var i in parts) {
      var part = parts[i];
      var planeGeometry = new THREE.PlaneGeometry(part.scale, part.scale);
      var material = new THREE.MeshBasicMaterial({
        color: part.color,
        side: THREE.DoubleSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false,
        visible: false
      });
      material['noFade'] = part['noFade'] === true;

      this.materials.push(material);
      var src = document.querySelector(textureSrcs[part.textureIdx]).getAttribute('src');
      this.el.sceneEl.systems.material.loadTexture(src, {src: src}, setMap.bind(this, i));

      function setMap (idx, texture) {
        this.materials[idx].alphaMap = texture;
        this.materials[idx].needsUpdate = true;
        this.materials[idx].visible = true;
      }

      var dispersionCenter =  part.dispersion / 2;

      for (var n = 0; n < part.copies; n++) {
        var mesh = new THREE.Mesh(planeGeometry, material);
        if (!part.billboard) {
          mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        }
        else if (this.data.lookAt) {
          mesh.lookAt(this.data.lookAt);
        }
        if (part.dispersion > 0) {
          mesh.position.set(
            Math.random() * part.dispersion - dispersionCenter,
            Math.random() * part.dispersion - dispersionCenter,
            Math.random() * part.dispersion - dispersionCenter
          );
          mesh.speed = part.speed + Math.random() / part.dispersion;
        }

        mesh.part = part;
        this.meshes.add(mesh);
      }
    }

    this.el.setObject3D('explosion', this.meshes);
  },

  reset: function () {
    this.life = 0;
    this.starttime = null;
    this.system.system.returnToPool(this.data.name, this.el);
  },

  tick: function (time, delta) {
    if (this.starttime === null) {
      this.starttime = time;
    }
    this.life = (time - this.starttime) / this.data.duration;

    if (this.life > 1) {
      this.system.returnToPool(this.data.type, this.el);
      return;
    }

    var t =  this.life * ( 2 - this.life ); //out easing

    for (var i = 0; i < this.meshes.children.length; i++){
      var mesh = this.meshes.children[i];
      var s = 1 + t * mesh.part.grow;
      mesh.scale.set(s, s, s);
      if (mesh.part.speed > 0) {
        mesh.position.multiplyScalar( 1 + delta / 1000 * mesh.speed);
      }
    }
    for (var i in this.materials) {
      if (this.materials[i].noFade) {
        continue;
      }
      this.materials[i].opacity = 1 - t;
    }
  }
});
