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
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/player-bullet.json)'
      }
    },
    poolSize: 1
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#24CAFF');
      el.setAttribute('scale', {x: 0.1, y: 0.1, z: 0.1});
    },
    reset: function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#24CAFF');
      el.setAttribute('scale', {x: 0.1, y: 0.1, z: 0.1});
    },
    tick: function (time, delta) {
    },
    onHit: function (type) {
      this.el.setAttribute('material', 'color', '#FFF');
    }
  }
);
