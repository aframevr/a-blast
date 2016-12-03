/* globals ABLAST */
ABLAST.registerBullet(
  // name
  'enemy-slow',
  // data
  {
    components: {
      bullet: {
        name: 'enemy-slow',
        maxSpeed: 0.5,
        initialSpeed: 0.1,
        acceleration: 0.03,
        destroyable: true,
        color: '#FFB911'
      },
      'collision-helper': {
        debug: false,
        radius: 0.13
      },
      'json-model': {
        src: '#enemyBullet'
      }
    },
    poolSize: 10
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      var color = this.bullet.components.bullet.color;
      el.setAttribute('material', 'color', color);
      el.setAttribute('scale', {x: 0.13, y: 0.13, z: 0.13});
      this.trail = null;
      this.glow = null;
      var self = this;
      el.addEventListener('model-loaded', function(event) {
        // @todo Do it outside
        event.detail.model.children[0].material.color.setStyle(color);
        self.trail = self.el.getObject3D('mesh').getObjectByName('trail');
        self.trail.scale.setY(0.001);
        self.glow = self.el.getObject3D('mesh').getObjectByName('glow');
      });
    },
    reset: function () {
      var el = this.el;
      el.setAttribute('scale', {x: 0.13, y: 0.13, z: 0.13});
      if (this.trail) {
        this.trail.scale.setY(0.001);
      }
    },
    tick: function (time, delta) {
      //stretch trail
      if (this.trail && this.trail.scale.y < 0.3) {
        var trailScale = this.trail.scale.y + delta/1000;
        if (trailScale > 0.3) { trailScale = 0.3; }
        this.trail.scale.setY(trailScale);
      }
      if (this.glow) {
        var sc = 1 + Math.sin(time / 20.0) * 0.1;
        this.glow.scale.set(sc, sc, sc);
      }
    },
    onHit: function (type) {
    }
  }
);
