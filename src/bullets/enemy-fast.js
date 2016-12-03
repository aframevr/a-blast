/* globals ABLAST */
ABLAST.registerBullet(
  // name
  'enemy-fast',
  // data
  {
    components: {
      bullet: {
        name: 'enemy-fast',
        maxSpeed: 0.1,
        initialSpeed: 0.1,
        acceleration: 0.1,
        destroyable: true,
        color: '#FF7F00'
      },
      'collision-helper': {
        debug: false,
        radius: 0.1
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
      el.setAttribute('scale', {x: 0.09, y: 0.09, z: 0.09});
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
      el.setAttribute('scale', {x: 0.09, y: 0.09, z: 0.09});
      if (this.trail) {
        this.trail.scale.setY(0.001);
      }
    },
    tick: function (time, delta) {
      //stretch trail
      if (this.trail && this.trail.scale.y < 1) {
        var trailScale = this.trail.scale.y + delta/1000;
        if (trailScale > 1) { trailScale = 1; }
        this.trail.scale.setY(trailScale);
      }
      if (this.glow) {
        var sc = 1 + Math.sin(time / 10.0) * 0.1;
        this.glow.scale.set(sc, sc, sc);
      }
    },
    onHit: function (type) {
    }
  }
);
