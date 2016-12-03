/* globals ABLAST */
var randomPointInSphere = require('../utils.js').randomPointInSphere;

ABLAST.registerEnemy(
  // name
  'enemy_static',
  // data
  {
    components: {
      'enemy': {
        name: 'enemy_static',
        color: '#FFF'
      },
      'collision-helper': {
        debug: true,
        radius: 0.65
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/enemy0.json)',
        texturePath: 'url(https://feiss.github.io/a-shooter-assets/images/)',
        singleModel: true
      }
    },
    poolSize: 10
  },
  // implementation
  {
    init: function () { this.reset(); },
    reset: function () {},
    tick: function (time, delta) {},
    onHit: function (type) {}
  }
);
