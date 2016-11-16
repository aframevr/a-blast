/* globals AFRAME ASHOOTER THREE */

AFRAME.registerComponent('explosion', {
  schema: {
    duration: { default: 500 },
    color: { type: 'color', default: '#FFFFFF' }
  },

  init: function () {
    var self = this;
    this.scale = 0;
    this.life = 0;
    this.starttime = null;
    this.meshes = new THREE.Group();


    this.materials = [];
    var textureSrcs = new Array('#fx1', '#fx2', '#fx3', '#fx4');

    var parts = [
      {textureIdx: 2, billboard: true,  color: 16777215, scale: 1.5, grow: 4, dispersion: 0, copies: 1, speed: 0 },
      {textureIdx: 0, billboard: true,  color: 16777215, scale: 0.4, grow: 2, dispersion: 2.5, copies: 3, speed: 1 },
      {textureIdx: 3, billboard: false, color: this.data.color, scale: 1, grow: 6, dispersion: 0, copies: 1, speed: 0 },
      {textureIdx: 1, billboard: true,  color: 16577633, scale: 0.04, grow: 2, dispersion: 3, copies: 20, speed: 2},
      {textureIdx: 3, billboard: true,  color: this.data.color, scale: 0.2, grow: 2, dispersion: 2, copies: 10, speed: 1}
    ];

    for (var i in parts) {
      var part = parts[i];
      var planeGeometry = new THREE.PlaneGeometry(part.scale, part.scale);
      var material = new THREE.MeshBasicMaterial({
        color: part.color,
        side: THREE.DoubleSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false
      });

      this.materials.push(material);
      var src = document.querySelector(textureSrcs[part.textureIdx]).getAttribute('src');
      this.el.sceneEl.systems.material.loadTexture(src, {src: src}, setMap.bind(this, i));
      
      function setMap (idx, texture) {
        this.materials[idx].alphaMap = texture;
        this.materials[idx].needsUpdate = true;
      }

      var dispersionCenter =  part.dispersion / 2;

      for (var n = 0; n < part.copies; n++) {
        var mesh = new THREE.Mesh(planeGeometry, material);
        if (!part.billboard) {
          mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
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

  update: function (oldData) {
  },

  tick: function (time, delta) {
    if (this.starttime === null){
      this.starttime = time;
    }
    this.life = (time - this.starttime) / this.data.duration;

    if (this.life > 1) return;

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
      this.materials[i].opacity = 1 - t;
    }
  }
});
