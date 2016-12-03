/* globals ABLAST */
ABLAST.registerBullet(
  // name
  'enemy-fat',
  // data
  {
    components: {
      bullet: {
        name: 'enemy-fat',
        maxSpeed: 0.3,
        initialSpeed: 0.1,
        acceleration: 0.04,
        destroyable: true,
        color: '#8762FF'
      },
      'collision-helper': {
        debug: false,
        radius: 0.5
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
      el.setAttribute('scale', {x: 0.5, y: 0.5, z: 0.5});
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
      el.setAttribute('scale', {x: 0.5, y: 0.5, z: 0.5});
      if (this.trail) {
        this.trail.scale.setY(0.001);
      }
    },
    tick: function (time, delta) {
      //stretch trail
      if (this.trail && this.trail.scale.y < 0.1) {
        var trailScale = this.trail.scale.y + delta/1000;
        if (trailScale > 0.1) { trailScale = 0.1; }
        this.trail.scale.setY(trailScale);
      }
      if (this.glow) {
        var sc = 1 + Math.abs(Math.sin(time / 80.0) * 0.4);
        this.glow.scale.set(sc, sc, sc);
      }
    },
    onHit: function (type) {
    }
  }
);
