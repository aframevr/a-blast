/* globals ASHOOTER */
ASHOOTER.registerBullet(
  // name
  'default',
  // data
  {
    components: {
      bullet: {
        name: 'default',
        maxSpeed: 1,
        initialSpeed: 0.1,
        acceleration: 0.4
      },
      'collision-helper': {
        debug: false,
        radius: 0.1
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/player-bullet.json)'
      }
    },
    poolSize: 1
  },
  // implementation
  {
    init: function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#24CAFF');
      el.setAttribute('scale', {x: 0.1, y: 0.1, z: 0.1});
      this.trail = null;
      var self = this;
      el.addEventListener('model-loaded', function(event) {
        // @todo Do it outside
        //event.detail.model.children[0].material.color.setRGB(1,0,0);
        self.trail = self.el.getObject3D('mesh').getObjectByName('trail');
        self.trail.scale.setY(0.001);
      });
    },
    reset: function () {
      var el = this.el;
      el.setAttribute('scale', {x: 0.1, y: 0.1, z: 0.1});
      if (this.trail) {
        this.trail.scale.setY(0.001);
      }
    },
    tick: function (time, delta) {
      //stretch trail
      if (this.trail && this.trail.scale.y < 1) {
        var trailScale = this.trail.scale.y + delta/50;
        if (trailScale > 1) { trailScale = 1; }
        this.trail.scale.setY(trailScale);
      }
    },
    onHit: function (type) {
      this.el.setAttribute('material', 'color', '#FFF');
    }
  }
);
