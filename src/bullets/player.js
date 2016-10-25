/* globals ASHOOTER */
ASHOOTER.registerBullet(
  // name
  'default',
  // data
  {
    components: {
      bullet: {
        name: 'default',
        maxSpeed: 1,
        initialSpeed: 0.1,
        acceleration: 0.4
      },
      'collision-helper': {
        debug: false,
        radius: 0.1
      }
    },
    poolSize: 10
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      el.setAttribute('geometry', {primitive: 'octahedron', radius: 0.08, detail: 1});
      el.setAttribute('material', {shader: 'flat', color: '#24CAFF'});
    },
    reset: function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#24CAFF');
      el.setAttribute('scale', {x: 1, y: 1, z: 1});
    },
    tick: function (time, delta) {
    },
    onHit: function (type) {
      this.el.setAttribute('material', 'color', '#FFF');
    }
  }
);
