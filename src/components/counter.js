var LetterPanel = require('../letterpanel');

/* global THREE AFRAME */
AFRAME.registerComponent('counter', {
  schema: {
    width: {default: 0.9},
    value: {default: ''},
    numSegments: {default: 5}
  },

  init: function () {
    this.letterPanel = new LetterPanel(this.el.sceneEl.systems.material, this.data.numSegments, this.data.width);
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

AFRAME.registerComponent('points', {
  schema: {
    value: {default: 0},
  },

  init: function () {
    this.letterPanel = new LetterPanel(this.el.sceneEl.systems.material, 3, 0.9);
    this.el.setObject3D('mesh', this.letterPanel.group);
  },

  update: function () {
    this.letterPanel.update(this.data.value.padLeft(3));
  }
});
