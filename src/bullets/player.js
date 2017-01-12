/* globals ABLAST */
ABLAST.registerBullet(
  // name
  'default',
  // data
  {
    components: {
      bullet: {
        name: 'default',
        maxSpeed: 1,
        initialSpeed: 0.1,
        acceleration: 0.4,
        color: '#24CAFF'
      },
      'collision-helper': {
        debug: false,
        radius: 0.2
      },
      'json-model': {
        src: '#playerBullet'
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
      el.setAttribute('scale', {x: 0.2, y: 0.2, z: 0.2});
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
      el.setAttribute('scale', {x: 0.2, y: 0.2, z: 0.2});
      if (this.trail) {
        this.trail.scale.setY(0.001);
      }
    },
    tick: function (time, delta) {
      //stretch trail
      if (this.trail && this.trail.scale.y < 1) {
        var trailScale;
        if (this.trail.scale.y < 0.005) {
          trailScale = this.trail.scale.y + 0.001;
        }
        else {
          trailScale = this.trail.scale.y + delta/50;
        }
        if (trailScale > 1) { trailScale = 1; }
        this.trail.scale.setY(trailScale);
      }
    },
    onHit: function (type) {
      this.el.setAttribute('material', 'color', '#FFF');
    }
  }
);
