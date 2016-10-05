/* global AFRAME */
AFRAME.registerComponent('shoot-controls', {
  dependencies: ['tracked-controls'],
  schema: {
    hand: { default: 'left' }
  },

  init: function () {
    var self = this;

    this.onButtonChanged = this.onButtonChanged.bind(this);
    this.onButtonDown = function (evt) { self.onButtonEvent(evt.detail.id, 'down'); };
    this.onButtonUp = function (evt) { self.onButtonEvent(evt.detail.id, 'up'); };
    this.onModelLoaded = this.onModelLoaded.bind(this);
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
      var buttonName = this.mapping['button' + evt.detail.id];
      var value;
      if (buttonName !== 'trigger') { return; }
      value = evt.detail.state.value;
//      if (value > 0.5)
//        this.el.emit('triggerdown');
  },

  onModelLoaded: function (evt) {
    // var controllerObject3D = evt.detail.model;
  },

  onButtonEvent: function (id, evtName) {
    var buttonName = this.mapping['button' + id];
    this.el.emit(buttonName + evtName);
  },

  update: function () {
    var data = this.data;
    var el = this.el;
    // handId: 0 - right, 1 - left
    var controller = data.hand === 'right' ? 0 : 1;
    el.setAttribute('tracked-controls', 'controller', controller);
  }
});
