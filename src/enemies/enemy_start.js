/* globals ABLAST */

ABLAST.registerEnemy(
  // name
  'enemy_start',
  // data
  {
    components: {
      enemy: {
        name: 'enemy_start',
        color: '#FFB911',
        scale: 0.9,
        health: 1
      },
      'collision-helper': {
        debug: false,
        radius: 0.4
      },
      'json-model': {
        src: 'url(assets/models/enemy0.json)',
        texturePath: 'url(assets/images/)',
        singleModel: true
      }
    },
    poolSize: 1
  },
  // implementation
  {
    init: function () {
      this.shootingDelay = 3000;
      this.warmUpTime = 1000;
      this.reset();
    },
    reset: function () {
      var el = this.el;
      var sc = this.data.scale;
      el.addEventListener('model-loaded', function(event) {
        el.getObject3D('mesh').scale.set(sc, sc, sc);
      });
      this.lastShoot = undefined;
      this.willShootEmited = false;
    },
    tick: function (time, delta) {
      this.el.components.enemy.willShoot(time, delta, this.warmUpTime);
    },
    onHit: function (type) {}
  }
);
