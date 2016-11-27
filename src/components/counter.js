var LetterPanel = require('../letterpanel');

/* global THREE AFRAME */
AFRAME.registerComponent('counter', {
  schema: {
    width: {default: 0.9},
    value: {default: ''},
    numSegments: {default: 5},
    height: {default: 0.35},
    color: {default: 0x024caff}
  },

  init: function () {
    this.letterPanel = new LetterPanel(this.el.sceneEl.systems.material, this.data);
    this.el.setObject3D('mesh', this.letterPanel.group);
    var self = this;
    this.el.sceneEl.addEventListener('countdown-update', function(event) {
      var t = event.detail;
      var value = t.minutes.padLeft(2) + ':' + t.seconds.padLeft(2);
      self.letterPanel.material.color.set(t.total <= 10000 ? 0xff0000 : 0x24caff);
      self.el.setAttribute('counter', {value: value});
    });
  },

  update: function () {
    this.letterPanel.update(this.data.value);
  },
});

/* global THREE AFRAME */
AFRAME.registerComponent('lifes-counter', {
  schema: {
    width: {default: 0.9},
    value: {default: '00000'},
    numSegments: {default: 6},
    height: {default: 0.2},
    color: {default: 0xff0000}
  },

  init: function () {
    this.letterPanel = new LetterPanel(this.el.sceneEl.systems.material, this.data);
    this.el.setObject3D('mesh', this.letterPanel.group);
    var self = this;
  },

  update: function () {
    var value = this.data.value;
    var computed = [0,0,0,0,0].map(function(e,i) {return i >= value ? '0': '1'}).reverse().join('');
    this.letterPanel.update(computed);
  },
});



AFRAME.registerComponent('points', {
  schema: {
    value: {default: 0},
    height: {default: 0.7},
    numSegments: {default: 3},
    width: {default: 0.9},
    color: {default: 0x024caff}
  },

  init: function () {
    this.letterPanel = new LetterPanel(this.el.sceneEl.systems.material, this.data);
    this.el.setObject3D('mesh', this.letterPanel.group);
  },

  update: function () {
    this.letterPanel.update(this.data.value.padLeft(3));
  }
});
