ASHOOTER.registerEnemy(
  // name
  'enemy0',
  // data
  {
    components: {
      enemy: {
        name: 'enemy0'
      },
      'json-model': {
        src: 'url(https://fernandojsg.github.io/a-shooter-assets/models/enemy0.json)'
      }
    },
    poolSize: 1
  },
  // implementation
  {
    init: function () { this.reset(); },
    reset: function () {
      this.el.removeAttribute('movement-pattern');
      this.el.setAttribute('position', 'y', -10);
      this.el.setAttribute('movement-pattern', {
        type: 'random', debug: false
      });
    },
    tick: function (time, delta) {},
    onHit: function (type) {}
  }
);
