ASHOOTER.registerBullet(
  // name
  'default',
  // data
  {
    components: {
      bullet: {
        name: 'default',
        maxSpeed: 10,
        acceleration: 0.3, //0.5,
      },
      'collision-helper': {
        debug: true,
        radius: 0.1
      }
    },
    poolSize: 1
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      el.setAttribute('geometry', {primitive: 'octahedron', radius: 0.1});
      el.setAttribute('material', {shader: 'flat', color: '#ff0'});
    },
    reset: function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#ff0');
      el.setAttribute('scale', {x: 1, y: 1, z: 1});
    },
    tick: function (time, delta) {
    },
    onHit: function (type) {
      this.el.setAttribute('material', 'color', '#AAA');
    }
  }
);
