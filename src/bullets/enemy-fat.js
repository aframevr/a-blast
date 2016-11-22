/* globals ASHOOTER */
ASHOOTER.registerBullet(
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
        destroyable: true
      },
      'collision-helper': {
        debug: false,
        radius: 1.1
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/enemy-bullet.json)'
      }
    },
    poolSize: 10
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#F70');
      el.setAttribute('scale', {x: 1, y: 1, z: 1});
      this.trail = null;
      this.glow = null;
      var self = this;
      el.addEventListener('model-loaded', function(event) {
        // @todo Do it outside
        event.detail.model.children[0].material.color.setHex(0xFF7700);
        self.trail = self.el.getObject3D('mesh').getObjectByName('trail');
        self.trail.scale.setY(0.001);
        self.glow = self.el.getObject3D('mesh').getObjectByName('glow');
      });
    },
    reset: function () {
      var el = this.el;
      el.setAttribute('scale', {x: 1, y: 1, z: 1});
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
        var sc = 1 + Math.abs(Math.sin(time / 80.0) * 0.4);
        this.glow.scale.set(sc, sc, sc);
      }
    },
    onHit: function (type) {
    }
  }
);
