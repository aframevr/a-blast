/* globals ASHOOTER */
ASHOOTER.registerBullet(
  // name
  'enemy-fast',
  // data
  {
    components: {
      bullet: {
        name: 'enemy-fast',
        maxSpeed: 0.1,
        initialSpeed: 0.1,
        acceleration: 0.1
      },
      'collision-helper': {
        debug: false,
        radius: 0.08
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
      el.setAttribute('material', 'color', '#FF3468');
      el.setAttribute('scale', {x: 0.06, y: 0.06, z: 0.06});
    },
    reset: function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#FF3468');
      el.setAttribute('scale', {x: 0.06, y: 0.06, z: 0.06});
    },
    tick: function (time, delta) {
      
    },
    onHit: function (type) {
    }
  }
);
