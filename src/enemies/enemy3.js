/* globals ASHOOTER */
var randomPointInSphere = require('../utils.js').randomPointInSphere;

ASHOOTER.registerEnemy(
  // name
  'enemy3',
  // data
  {
    components: {
      enemy: {
        name: 'enemy3'
      },
      'collision-helper': {
        debug: true,
        radius: 0.65
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/enemy3.json)',
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
      var position = randomPointInSphere(5, 10);
      el.setAttribute('position', position);
    },
    tick: function (time, delta) {
      var el = this.el;

      var position = el.getAttribute('position');

      if (position.x > 5) { this.direction = -1; }
      if (position.x < -5) { this.direction = 1; }
      position.x += this.direction * delta / 500;
      el.setAttribute('position', position);

      var scale = (Math.sin(time / 50) + 1) / 2;
      var scaley = scale * 0.2 + 0.8;
      var scalex = (1 - scale) * 0.2 + 0.8;
      el.setAttribute('scale', {x: scalex, y: scaley, z: 1});
    },
    onHit: function (type) {}
  }
);
