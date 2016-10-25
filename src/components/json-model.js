/* globals AFRAME THREE */
AFRAME.registerComponent('json-model', {
  schema: {
    src: {type: 'src'},
    vertexcolors: {default: false},
    debugNormals: {default: false},
    debugNormalsLength: {default: 0.2}
  },

  init: function () {
    this.objectLoader = new THREE.ObjectLoader();
    this.objectLoader.setCrossOrigin('');
    this.helpers = new THREE.Group();
    this.mixer = null;
    this.animation = null;
    this.animationNames = [];
  },

  fixNormal: function (vector) {
    var t = vector.y;
    vector.y = -vector.z;
    vector.z = t;
  },

  update: function (oldData) {
    var self = this;
    var src = this.data.src;
    if (!src || src === oldData.src) { return; }

    this.objectLoader.load(this.data.src, function (group) {
      self.helpers = new THREE.Group();

      if (group['animations'] !== undefined) {
        for (var i in group.animations) {
          self.animationNames[group.animations[i].name] = group.animations[i];
        }
        self.mixer = new THREE.AnimationMixer( group );
      }

      // var Rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
      group.traverse(function (child) {
        if (!(child instanceof THREE.Mesh)) { return; }

/*
        // child.position.applyMatrix4(Rotation);
        child.geometry.faces.forEach(face => {
          self.fixNormal(face.normal);
          face.vertexNormals.forEach(vertex => {
            if (!vertex.hasOwnProperty('fixed')) {
              self.fixNormal(vertex);
              vertex.fixed = true;
            }
          });
        });
*/
        child.geometry.normalsNeedUpdate = true;
        child.geometry.verticesNeedUpdate = true;

        fnh = new THREE.FaceNormalsHelper(child, self.data.debugNormalsLength);
        self.helpers.add(fnh);
        vnh = new THREE.VertexNormalsHelper(child, self.data.debugNormalsLength);
        self.helpers.add(vnh);
      });
      self.el.setObject3D('helpers', self.helpers);
      self.el.setObject3D('mesh', group);
      self.el.emit('model-loaded', {format: 'json', model: group, src: src});
      self.helpers.visible = self.data.debugNormals;
    });

    this.helpers.visible = this.data.debugNormals;
  },

  playAnimation: function (animationName, repeat) {
    this.animation = this.mixer.clipAction(this.animationNames[animationName]).stop().play();
    var repetitions = 0;
    if (repeat === true) repetitions = Infinity;
    else if (repeat == undefined) repeat = false;
    else if (typeof(repeat) == 'number') {
      if (repeat === 0) repeat = false;
      repetitions = repeat;
    }
    else repeat = false;
    this.animation.setLoop( repeat ? THREE.LoopRepeat : THREE.LoopOnce, repetitions );
  },

  tick: function(time, timeDelta) {
    if( this.mixer ) {
      this.mixer.update( timeDelta / 1000 );
    }
  }
});
