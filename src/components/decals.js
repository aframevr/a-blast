/* globals AFRAME THREE */
AFRAME.registerSystem('decals', {
  schema: {
    size: {default: 0.1},
    src: {default: '', type: 'asset'},
    maxDecals: {default: 30} // 0 for infinite
  },

  init: function () {
    this.numDecals = 0;
    this.decals = [];
    this.oldestDecalIdx = 0;
    this.textureSrc = null;

    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      color: '#24CAFF',
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -20
    });

    this.updateMap();
  },

  updateMap: function () {
    var src = this.data.src;

    if (src) {
      if (src === this.textureSrc) { return; }
      // Texture added or changed.
      this.textureSrc = src;
      this.sceneEl.systems.material.loadTexture(src, {src: src}, setMap.bind(this));
      return;
    }

    // Texture removed.
    if (!this.material.map) { return; }
    setMap(null);

    function setMap (texture) {
      this.material.map = texture;
      this.material.needsUpdate = true;
    }
  },

  update: function (oldData) {
    this.updateMap();
  },

  getDecal: function () {
    var maxDecals = this.data.maxDecals;
    var size = this.data.size;
    var decal = null;

    if (maxDecals === 0 || this.numDecals < maxDecals) {
      decal = new THREE.Mesh(this.geometry, this.material);
      this.numDecals++;
      this.decals.push(decal);
    } else {
      decal = this.decals[this.oldestDecalIdx];
      this.oldestDecalIdx = (this.oldestDecalIdx + 1) % this.data.maxDecals;
    }
    decal.scale.set(size, size, size);

    return decal;
  },

  addDecal: function (point, normal) {
    var decal = this.getDecal();
    if (decal) {
      decal.position.set(0, 0, 0);
      decal.position.copy(point);
      decal.lookAt(normal);
      decal.rotation.z += Math.random() * Math.PI * 2;
      this.sceneEl.object3D.add(decal);
    }
  }
});
