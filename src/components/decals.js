AFRAME.registerSystem('decals', {
  schema: {
    size: {default: 0.1},
    src: {default: ''},
    maxDecals: {default: 30} // 0 for infinite
  },

  init: function () {
    var data = this.data;

    this.numDecals = 0;
    this.decals = [];
    this.oldestDecalIdx = 0;
    this.textureSrc = null;

    this.geometry = new THREE.PlaneGeometry(data.size, data.size);
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      color: '#fff',
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
    var data = this.data;
    if (data.size !== oldData.size) {
      this.geometry = new THREE.PlaneGeometry(data.size, data.size);
    }

    this.updateMap();
  },

  getDecal: function () {
    var maxDecals = this.data.maxDecals;
    var decal = null;

    if (maxDecals === 0 || this.numDecals < maxDecals) {
      var data = this.data;
      decal = new THREE.Mesh(this.geometry, this.material);
      this.numDecals++;
      this.decals.push(decal);
    } else {
      decal = this.decals[this.oldestDecalIdx];
      this.oldestDecalIdx = (this.oldestDecalIdx + 1) % this.data.maxDecals;
    }

    return decal;
  },

  addDecal: function (point, normal) {
    var decal = this.getDecal();
    if (decal) {
      decal.position.set(0, 0, 0);
      decal.position.copy(point);
      decal.lookAt(normal);
      this.sceneEl.object3D.add(decal);
    }
  }
});
