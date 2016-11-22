/* globals ASHOOTER */
var randomPointInSphere = require('../utils.js').randomPointInSphere;

ASHOOTER.registerEnemy(
  // name
  'enemy3',
  // data
  {
    components: {
      enemy: {
        name: 'enemy3',
        bulletName: 'enemy-fat'
      },
      'collision-helper': {
        debug: false,
        radius: 4
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/enemy3.json)',
        texturePath: 'url(https://feiss.github.io/a-shooter-assets/images/)',
        singleModel: true
      }
    },
    poolSize: 2
  },
  // implementation
  {
    init: function () { this.reset(); },
    reset: function () {
      this.el.setAttribute('scale', {x: 4, y: 4, z: 4});
    },
    tick: function (time, delta) {},
    onHit: function (type) {}
  }
);
