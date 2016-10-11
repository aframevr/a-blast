var randomPointInSphere = require('../utils.js').randomPointInSphere;

ASHOOTER.registerEnemy(
  // name
  'enemy2',
  // data
  {
    components: {
      enemy: {
        name: 'enemy2'
      },
      'collision-helper': {
        debug: true,
        radius: 0.65
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/enemy2.json)'
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
      el.setAttribute('position',  position);
      this.direction = 1;
    },
    tick: function (time, delta) {
      var el = this.el;

      var position = el.getAttribute('position');

      if (position.x > 5) { this.direction = -1 }
      if (position.x < -5) { this.direction = 1 }
      position.x += this.direction * delta / 500;
      el.setAttribute('position',  position);
    },
    onHit: function (type) {}
  }
);
