/* globals ASHOOTER */
ASHOOTER.registerBullet(
  // name
  'enemy-slow',
  // data
  {
    components: {
      bullet: {
        name: 'enemy-slow',
        maxSpeed: 0.03,
        initialSpeed: 0.01,
        acceleration: 0.01
      },
      'collision-helper': {
        debug: false,
        radius: 0.15
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/enemy-bullet.json)'
      }
    },
    poolSize: 1
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#F00');
      el.setAttribute('scale', {x: 0.11, y: 0.11, z: 0.11});
    },
    reset: function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#F00');
      el.setAttribute('scale', {x: 0.11, y: 0.11, z: 0.11});
    },
    tick: function (time, delta) {
    },
    onHit: function (type) {
    }
  }
);
