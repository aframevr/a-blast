var randomPointInSphere = require('../utils.js').randomPointInSphere;

ASHOOTER.registerEnemy(
  // name
  'enemy_static',
  // data
  {
    components: {
      'enemy': {
        name: 'enemy_static'
      },
      'collision-helper': {
        debug: true,
        radius: 0.65
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/enemy0.json)'
      }
    },
    poolSize: 1
  },
  // implementation
  {
    init: function () { this.reset(); },
    reset: function () {
      var el = this.el;
      var position = randomPointInSphere(5, 20);
      position = {x: 0, y: 1, z: -3};
      el.setAttribute('position',  position);
    },
    tick: function (time, delta) {},
    onHit: function (type) {}
  }
);
