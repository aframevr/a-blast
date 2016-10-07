ASHOOTER.registerEnemy(
  // name
  'enemy1',
  // data
  {
    components: {
      enemy: {
        name: 'enemy1'
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
      this.el.setAttribute('position', 'y', 5);
      this.el.setAttribute('movement-pattern', {
        type: 'toEntity', target: '#player', debug: false
      });
    },
    tick: function (time, delta) {},
    onHit: function (type) {}
  }
);
