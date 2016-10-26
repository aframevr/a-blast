/* globals ASHOOTER */
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
<<<<<<< cddba21cdad1e22d0582061bd29adf2473886e02
    reset: function () {},
=======
    reset: function () {
      var el = this.el;
      var position = randomPointInSphere(5, 20);
      position = {x: 4, y: 1, z: -10};
      //position = {x: 0, y: 0, z: -3};
      el.setAttribute('position', position);
    },
>>>>>>> Fixed bullets orientation
    tick: function (time, delta) {},
    onHit: function (type) {}
  }
);
