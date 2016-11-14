/* globals ASHOOTER */
var randomPointInSphere = require('../utils.js').randomPointInSphere;

ASHOOTER.registerEnemy(
  // name
  'enemy1',
  // data
  {
    components: {
      enemy: {
        name: 'enemy1'
      },
      'collision-helper': {
        debug: true,
        radius: 0.6
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/enemy1.json)',
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
      position.y = 5;
      el.setAttribute('position', position);

      el.removeAttribute('movement-pattern');
      el.setAttribute('movement-pattern', {
        type: 'toEntity', target: '#player', debug: false
      });
    },
    tick: function (time, delta) {},
    onHit: function (type) {}
  }
);
