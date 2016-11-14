/* globals ASHOOTER */
var randomPointInSphere = require('../utils.js').randomPointInSphere;

ASHOOTER.registerEnemy(
  // name
  'enemy0',
  // data
  {
    components: {
      enemy: {
        name: 'enemy0'
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
    poolSize: 1
  },
  // implementation
  {
    init: function () { this.reset(); },
    reset: function () {
      var el = this.el;
      var position = randomPointInSphere(5, 20);
      position.y = -10;
      el.setAttribute('position', position);

      el.removeAttribute('movement-pattern');
      el.setAttribute('movement-pattern', {
        type: 'random', debug: false
      });
    },
    tick: function (time, delta) {},
    onHit: function (type) {}
  }
);
