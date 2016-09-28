AFRAME.registerBullet(
  // name
  'default',
  // data
  {
    speed: 10,
    acceleration: 5,
    poolSize: 5
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      el.setAttribute('geometry', {primitive: 'octahedron', radius: 0.1});
      el.setAttribute('material', {shader: 'standard', color: '#ff0'});
    },
    tick: function (time, delta) {
      
    }
  }
);
