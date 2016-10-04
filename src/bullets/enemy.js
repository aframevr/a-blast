AFRAME.registerBullet(
  // name
  'enemy',
  // data
  {
    maxSpeed: 10,
    acceleration: 0.3,
    poolSize: 20
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      el.setAttribute('geometry', {primitive: 'icosahedron', radius: 0.08, detail: 0});
      el.setAttribute('material', {shader: 'standard', flatShading: true, color: '#f00'});
    },
    reset: function () {
    },
    tick: function (time, delta) {
    },
    onHit: function (type) {
    }
  }
);
