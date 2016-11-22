/* globals ASHOOTER */
var randomPointInSphere = require('../utils.js').randomPointInSphere;

ASHOOTER.registerEnemy(
  // name
  'enemy2',
  // data
  {
    components: {
      enemy: {
        name: 'enemy2',
        bulletName: 'enemy-slow'
      },
      'collision-helper': {
        debug: false,
        radius: 0.65
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/enemy2.json)',
        texturePath: 'url(https://feiss.github.io/a-shooter-assets/images/)',
        singleModel: true
      }
    },
    poolSize: 10
  },
  // implementation
  {
    init: function () { this.reset(); },
    reset: function () {
      this.el.setAttribute('scale', {x: 2, y: 2, z: 2});
    },
    tick: function (time, delta) {},
    onHit: function (type) {}
  }
);
