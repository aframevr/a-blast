/* globals AFRAME THREE */
AFRAME.registerComponent('json-model', {
  schema: {
    src: {type: 'asset'},
    singleModel: {default: false},
    texturePath: {type: 'asset', default: ''},
    debugNormals: {default: false},
    debugNormalsLength: {default: 0.2},
    debugBones: {default: false}
  },

  init: function () {
  },

  fixNormal: function (vector) {
    var t = vector.y;
    vector.y = -vector.z;
    vector.z = t;
  },

  update: function (oldData) {
    this.loader = null;
    this.helpers = new THREE.Group();
    this.mixers = [];
    this.animationNames = [];
    this.skeletonHelper = null;

    var src = this.data.src;
    if (!src || src === oldData.src) { return; }

    if (this.data.singleModel) {
      this.loader = new THREE.JSONLoader();
      this.loader.setTexturePath(this.data.texturePath);
      this.loader.load(src, this.onModelLoaded.bind(this));
    }
    else {
      this.loader = new THREE.ObjectLoader();
      this.loader.setCrossOrigin('');
      this.loader.load(src, this.onSceneLoaded.bind(this));
    }
  },

  onModelLoaded: function(geometry, materials) {
    this.helpers = new THREE.Group();

    var mesh = new THREE.SkinnedMesh(geometry, materials[0]);
    var self = this;
    mesh.geometry.faces.forEach(function(face) {
      face.vertexNormals.forEach(function(vertex) {
        if (!vertex.hasOwnProperty('fixed')) {
          self.fixNormal(vertex);
          vertex.fixed = true;
        }
      });
    });

    if (mesh.geometry['animations'] !== undefined && mesh.geometry.animations.length > 0){
      mesh.material.skinning = true;
      var mixer = {mixer: new THREE.AnimationMixer(mesh), clips: {}};
      for (var i in mesh.geometry.animations) {
        var anim = mesh.geometry.animations[i];
        var clip = mixer.mixer.clipAction(anim).stop();
        clip.setEffectiveWeight(1);
        mixer.clips[anim.name] = clip;
      }
      this.mixers.push(mixer);
    }

    self.addNormalHelpers(mesh);

    this.helpers.visible = this.data.debugNormals;
    this.el.setObject3D('helpers', this.helpers);

    this.skeletonHelper = new THREE.SkeletonHelper( mesh );
    this.skeletonHelper.material.linewidth = 2;
    this.el.setObject3D('skelhelper', this.skeletonHelper );
    this.skeletonHelper.visible = this.data.debugBones;

    this.el.setObject3D('mesh', mesh);
    this.el.emit('model-loaded', {format: 'json', model: mesh, src: this.data.src});
  },

  onSceneLoaded: function(group) {
    this.helpers = new THREE.Group();

    if (group['animations'] !== undefined) {
      var mixer = {mixer: new THREE.AnimationMixer(group), clips: {}};
      for (var i in group.animations) {
        var anim = group.animations[i];
        var clip = mixer.mixer.clipAction(anim).stop();
        mixer.clips[anim.name] = clip;
      }
      this.mixers.push(mixer);
    }
    var self = this;
    group.traverse(function (child) {
      if (!(child instanceof THREE.Mesh)) { return; }

      child.geometry.faces.forEach(function(face) {
        face.vertexNormals.forEach(function(vertex) {
          if (!vertex.hasOwnProperty('fixed')) {
            self.fixNormal(vertex);
            vertex.fixed = true;
          }
        });
      });

      self.addNormalHelpers(child);
    });

    this.helpers.visible = this.data.debugNormals;
    this.el.setObject3D('helpers', this.helpers);
    this.el.setObject3D('mesh', group);
    this.el.emit('model-loaded', {format: 'json', model: group, src: this.data.src});
  },

  addNormalHelpers: function (mesh) {
    var fnh = new THREE.FaceNormalsHelper(mesh, this.data.debugNormalsLength);
    this.helpers.add(fnh);
    var vnh = new THREE.VertexNormalsHelper(mesh, this.data.debugNormalsLength);
    this.helpers.add(vnh);

    mesh.geometry.normalsNeedUpdate = true;
    mesh.geometry.verticesNeedUpdate = true;
  },

  playAnimation: function (animationName, repeat) {
    for (var i in this.mixers) {
      var clip = this.mixers[i].clips[animationName];
      if (clip === undefined) continue;
      clip.stop().play();
      var repetitions = 0;
      if (repeat === true) repetitions = Infinity;
      else if (repeat == undefined) repeat = false;
      else if (typeof(repeat) == 'number') {
        if (repeat === 0) repeat = false;
        repetitions = repeat;
      }
      else repeat = false;
      clip.setLoop( repeat ? THREE.LoopRepeat : THREE.LoopOnce, repetitions );
    }
  },

  stopAnimation: function () {
    for (var i in this.mixers) {
      for (var j in this.mixers[i].clips) {
        this.mixers[i].clips[j].stop();
      }
    }
  },

  tick: function(time, timeDelta) {
    for (var i in this.mixers) {
      this.mixers[i].mixer.update( timeDelta / 1000 );
    }
  }
});
