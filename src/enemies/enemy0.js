/* globals ASHOOTER */
var randomPointInSphere = require('../utils.js').randomPointInSphere;

ASHOOTER.registerEnemy(
  // name
  'enemy0',
  // data
  {
    components: {
      enemy: {
        name: 'enemy0',
        bulletName: 'enemy-slow',
        color: '#FFB911'
      },
      'collision-helper': {
        debug: false,
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
    init: function () { 
      this.shootingDelay = 3000;
      this.warmUpTime = 1000;
      this.reset(); 
    },
    reset: function () {
      this.el.setAttribute('scale', {x: 2, y: 2, z: 2});
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
