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
        bulletName: 'enemy-fat',
        color: '#8762FF'
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
    init: function () { 
      this.shootingDelay = 5000;
      this.warmUpTime = 1000;
      this.reset(); 
    },
    reset: function () {
      this.el.setAttribute('scale', {x: 4, y: 4, z: 4});
      this.lastShoot = undefined;
      this.willShootEmited = false;
    },
    tick: function (time, delta) {
      if (this.lastShoot == undefined ) {
        this.lastShoot = time;
      }
      else if (time - this.lastShoot > this.shootingDelay) {
        this.el.components.enemy.shoot(time, delta);
        this.lastShoot = time;
        this.willShootEmited = false;
      }
      else if (!this.willShootEmited && time - this.lastShoot > this.shootingDelay - this.warmUpTime) {
        this.el.components.enemy.willShoot(time, delta, this.warmUpTime);
        this.willShootEmited = true;
      }
    },
    onHit: function (type) {}
  }
);
