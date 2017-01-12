/* globals ABLAST */
ABLAST.registerEnemy(
  // name
  'enemy0',
  // data
  {
    components: {
      enemy: {
        name: 'enemy0',
        bulletName: 'enemy-slow',
        color: '#FFB911',
        scale: 0.9,
        health: 1
      },
      'collision-helper': {
        debug: false,
        radius: 0.4
      },
      'json-model': {
        src: '#enemy0',
        texturePath: 'url(assets/images/)',
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
      var el = this.el;
      var sc = this.data.scale;
      this.actualShootingDelay = this.shootingDelay + Math.floor(this.shootingDelay * Math.random());

      el.addEventListener('model-loaded', function(event) {
        el.getObject3D('mesh').scale.set(sc, sc, sc);
      });
      this.lastShoot = undefined;
      this.willShootEmited = false;
    },
    tick: function (time, delta) {
      if (this.lastShoot == undefined ) {
        this.lastShoot = time;
      }
      else if (time - this.lastShoot > this.actualShootingDelay) {
        // don't shoot when behind the player
        var pos = this.el.getAttribute('position');
        if (pos.z < 0 && pos.y > 0) {
          this.el.components.enemy.shoot(time, delta);
          this.lastShoot = time;
          this.willShootEmited = false;
          this.actualShootingDelay = this.shootingDelay * (Math.random() < 0.7 ? 2 : 1);
        }
      }
      else if (!this.willShootEmited && time - this.lastShoot > this.actualShootingDelay - this.warmUpTime) {
        this.el.components.enemy.willShoot(time, delta, this.warmUpTime);
        this.willShootEmited = true;
      }
    },
    onHit: function (type) {}
  }
);
