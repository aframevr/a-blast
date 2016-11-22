/* globals ASHOOTER */
ASHOOTER.registerBullet(
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
        destroyable: true
      },
      'collision-helper': {
        debug: false,
        radius: 0.08
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
      el.setAttribute('material', 'color', '#FFBE34');
      el.setAttribute('scale', {x: 0.06, y: 0.06, z: 0.06});
      this.trail = null;
      var self = this;
      el.addEventListener('model-loaded', function(event) {
        // @todo Do it outside
        event.detail.model.children[0].material.color.setHex(0xFFBE34);
        self.trail = self.el.getObject3D('mesh').getObjectByName('trail');
        self.trail.scale.setY(0.001);
      });
    },
    reset: function () {
      var el = this.el;
      el.setAttribute('scale', {x: 0.06, y: 0.06, z: 0.06});
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
    },
    onHit: function (type) {
    }
  }
);
