AFRAME.registerBullet(
  // name
  'default',
  // data
  {
    maxSpeed: 10,
    acceleration: 0.5,
    poolSize: 1
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      el.setAttribute('geometry', {primitive: 'octahedron', radius: 0.1});
      el.setAttribute('material', {shader: 'flat', color: '#ff0'});
    },
    tick: function (time, delta) {

    },
    onHit: function (type) {
      this.el.setAttribute('material', 'color', '#AAA');
    }
  }
);
