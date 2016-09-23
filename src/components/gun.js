/* global AFRAME THREE */
AFRAME.registerComponent('gun', {
  dependencies: ['tracked-controls'],
  schema: {
    hand: { default: 'left' }
  },

  init: function () {
    var el = this.el;
    var self = this;

    this.onButtonChanged = this.onButtonChanged.bind(this);
    this.onButtonDown = function (evt) { self.onButtonEvent(evt.detail.id, 'down'); };
    this.onButtonUp = function (evt) { self.onButtonEvent(evt.detail.id, 'up'); };
    this.onModelLoaded = this.onModelLoaded.bind(this);

    el.setAttribute('json-model', {src: 'url(models/gun.json)'});

    /*
    this.el.setAttribute('sound', {
      src: 'sounds/gun0.ogg',
      on: 'shoot'
    });
*/
    this.fire = null;
    this.el.addEventListener('model-loaded', function (evt) {
      this.model = this.el.getObject3D('mesh');
      for (var i = 0; i < this.model.children.length; i++) {
        if (this.model.children[i].name === 'fire') {
          this.model.children[i].visible = false;
          this.fire = this.model.children[i];
          break;
        }
      }
    }.bind(this));

    this.lightIntensity = 0.5;
    this.model = this.el.getObject3D('mesh');
    this.life = this.data.lifespan;
    this.canShoot = true;

    this.light = document.createElement('a-entity');
    this.el.appendChild(this.light);

    this.light.setAttribute('light', {color: '#ff0', intensity: 0.0, type: 'point'});
    // this.light.setAttribute('geometry', {primitive: 'icosahedron', detail: 0, radius:0.05});
    this.light.setAttribute('position', {x: 0, y: -0.1, z: -0.2});
  },

  play: function () {
    var el = this.el;
    el.addEventListener('buttonchanged', this.onButtonChanged);
    el.addEventListener('buttondown', this.onButtonDown);
    el.addEventListener('buttonup', this.onButtonUp);
    el.addEventListener('model-loaded', this.onModelLoaded);
  },

  pause: function () {
    var el = this.el;
    el.removeEventListener('buttonchanged', this.onButtonChanged);
    el.removeEventListener('buttondown', this.onButtonDown);
    el.removeEventListener('buttonup', this.onButtonUp);
    el.removeEventListener('model-loaded', this.onModelLoaded);
  },

  // buttonId
  // 0 - trackpad
  // 1 - trigger ( intensity value from 0.5 to 1 )
  // 2 - grip
  // 3 - menu ( dispatch but better for menu options )
  // 4 - system ( never dispatched on this layer )
  mapping: {
    axis0: 'trackpad',
    axis1: 'trackpad',
    button0: 'trackpad',
    button1: 'trigger',
    button2: 'grip',
    button3: 'menu',
    button4: 'system'
  },

  onButtonChanged: function (evt) {
    // var button = this.mapping['button' + evt.detail.id];
    // value = evt.detail.state.value;
  },

  onModelLoaded: function (evt) {
    //var controllerObject3D = evt.detail.model;
  },

  onButtonEvent: function (id, evtName) {
    var buttonName = this.mapping['button' + id];
    if (buttonName === 'trigger' && evtName === 'down') {
      this.tryToShoot();
    }
    // this.el.emit(buttonName + evtName);
    // this.updateModel(buttonName, evtName);
  },

  tryToShoot: function () {
    if (this.canShoot) {
      this.shoot();
      this.canShoot = false;
      setTimeout(function () { this.canShoot = true; }.bind(this), 250);
      return true;
    }
    return false;
  },

  shoot: function () {
    var el = this.el;
    this.el.emit('shoot');
    var matrixWorld = el.object3D.matrixWorld;
    var position = new THREE.Vector3();
    var direction = new THREE.Vector3();
    position.setFromMatrixPosition(matrixWorld);
    var entity = document.createElement('a-entity');

    var light = this.light.getAttribute('light');
    light.intensity = this.lightIntensity;
    this.light.setAttribute('light', light);
    // this.fire.visible = true;

    var quaternion = new THREE.Quaternion();
    var translation = new THREE.Vector3();
    var scale = new THREE.Vector3();
    matrixWorld.decompose(translation, quaternion, scale);

    direction.set(0, -1.0, -1);
    direction.applyQuaternion(quaternion);
    direction.normalize();

    // direction.multiply(position);
    // position.z+=0.01;
    var inc = new THREE.Vector3(0.0, -0.03, -0.1);
    inc.applyQuaternion(quaternion);
    position.add(inc);
    entity.setAttribute('position', position);
    entity.setAttribute('bullet', {direction: direction, position: position});

/*
    console.log({
      x: THREE.Math.radToDeg(rotation.x),
      y: THREE.Math.radToDeg(rotation.y),
      z: THREE.Math.radToDeg(rotation.z)
    });
*/
    // entity.setAttribute('geometry', {primitive: 'box', width: 0.03, height: 0.03, depth: 0.1});
    // OctahedronGeometry
    entity.setAttribute('geometry', {primitive: 'octahedron', radius: 0.1});

    entity.setAttribute('material', {shader: 'standard', color: '#ff0'});
    entity.id = 'bullet';
    el.sceneEl.appendChild(entity);
  },

  tick: function (time, delta) {
    // console.log(this.el.getObject3D('mesh'));

    var light = this.light.getAttribute('light');
    if (light.intensity > 0.0) {
      light.intensity -= delta / 1000;
      if (light.intensity < 0.0) {
        light.intensity = 0.0;
      }

      this.light.setAttribute('light', light);

      var t = light.intensity / this.lightIntensity;
      if (this.fire) {
        this.fire.material.opacity = Math.sin(t * t);
        this.fire.material.transparent = true;
        // this.fire.position.copy(this.fire.parent.parent.position);

        // this.fire.applyMatrix( new THREE.Matrix4().setTranslation( 0, 10, 0 ) );
        // this.fire.applyMatrix( new THREE.Matrix4().makeScale( t,t,t ) );
        // console.log(this.fire.position, this.fire.parent.parent.position);
        // this.fire.scale.set(t,t,t);
      }
    } else {
      if (this.fire) {
        this.fire.visible = false;
      }
    }
  },

  update: function () {
    var data = this.data;
    var el = this.el;
    // handId: 0 - right, 1 - left
    var controller = data.hand === 'right' ? 0 : 1;
    el.setAttribute('tracked-controls', 'controller', controller);
  },

});
