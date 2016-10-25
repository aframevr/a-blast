/* globals ASHOOTER */
ASHOOTER.registerBullet(
  // name
  'enemy-slow',
  // data
  {
    components: {
      bullet: {
        name: 'enemy-slow',
        maxSpeed: 0.1,
        acceleration: 0
      }
    },
    poolSize: 10
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      el.setAttribute('geometry', {primitive: 'icosahedron', radius: 0.08, detail: 0});
      el.setAttribute('material', {shader: 'flat', color: '#f00'});
    },
    reset: function () {
    },
    tick: function (time, delta) {
    },
    onHit: function (type) {
    }
  }
);
