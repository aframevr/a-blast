AFRAME.registerComponent('countdown', {
  schema: {
    start: {default: '01:00'},
    value: {default: '00:00'}
  },

  init: function () {
    this.timeinterval = null;
    this.restart();
  },

  initializeClock: function (endtime) {
    var self = this;

    this.el.sceneEl.emit('countdown-start', endtime);
    function updateTimer() {
      var total = Date.parse(endtime) - Date.parse(new Date());
      var seconds = Math.floor( (total/1000) % 60 );
      var minutes = Math.floor( (total/1000/60) % 60 );
      var t = {
        'total': total,
        'minutes': minutes,
        'seconds': seconds
      };
      self.el.sceneEl.emit('countdown-update', t);
      if (t.total <= 0) {
        clearInterval(self.timeinterval);
        self.el.sceneEl.emit('countdown-end');
      }
    }

    this.timeinterval = setInterval(updateTimer, 1000);
    updateTimer();
  },

  stop: function () {
    clearInterval(this.timeinterval);
    this.el.sceneEl.emit('countdown-update', {
      'total': 0,
      'minutes': 0,
      'seconds': 0
    });
  },

  restart: function () {
    this.stop();

    var values = this.data.start.split(':').map(function(value) { return parseInt(value); });
    var deadline = new Date(Date.parse(new Date()) + (values[0] * 60 + values[1]) * 1000);
    this.initializeClock(deadline);
  }
});
