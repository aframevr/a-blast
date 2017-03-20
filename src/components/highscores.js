/* globals AFRAME ABLAST THREE */
AFRAME.registerSystem('highscores', {
  schema: {
    maxScores: {default: 10},
  },

  init: function () {
    if (!this.isHighScore()) {
      console.warn('Highscore can\'t be loaded or saved as no localStorage support found!');
      return;
    }

    this.scores = [];
    if (localStorage['highscores']) {
      this.scores = JSON.parse(localStorage['highscores']);
    } else {
      for (var i = 0; i < 5; i++) {
        this.scores[i] = {
          name: 'nobody',
          points: i*10,
          shoots: 0,
          time: 0,
          validShoot: 0
        };
      }
    }

    var self = this;
    var ablastUI = document.getElementById('ablast-ui');
    document.getElementById('save-score').addEventListener('click', function (event) {
      ABLAST.currentScore.name = document.getElementById('player-name').value;
      self.addNewScore(ABLAST.currentScore);
      ablastUI.style.display = 'none';
    });

    this.sceneEl.addEventListener('gamestate-changed', function (evt) {
      if ('state' in evt.detail.diff) {
        if (evt.detail.state.state === 'STATE_GAME_OVER' || evt.detail.state.state === 'STATE_GAME_WIN') {
          ablastUI.style.display = self.isHighScore(ABLAST.currentScore) ? 'block' : 'none';
        }
      }
    });
  },

  isHighScore: function ()
  {
    try {
    	return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  },

  shouldStoreScore: function (data) {
    return (this.scores.length < this.data.maxScores ||
      this.scores[this.scores.length - 1].points < data.points);
  },

  addNewScore: function (data) {
    // Check if we need to insert it
    if (this.shouldStoreScore(data)) {
      this.scores.push(data);

      this.scores.sort(function(a,b) {
        return parseInt(a.points) <= parseInt(b.points);
      });

      if (this.scores.length > this.data.maxScores) {
        this.scores.pop();
      }

      localStorage['highscores'] = JSON.stringify(this.scores);
      this.sceneEl.emit('highscores-updated', this.scores);
      return true;
    }
    return false;
  }
});

AFRAME.registerComponent('highscores', {
  schema: {},

  init: function () {
    var el = this.el;
    var self = this;
    var sceneEl = this.el.sceneEl;

    sceneEl.addEventListener('highscores-updated', function (event) {
      el.setAttribute('bmfont-text', {text: buildText(self.system.scores)});
    });

    el.setAttribute('bmfont-text', {
      fntImage: 'assets/fonts/mozillavr.png',
      fnt: 'assets/fonts/mozillavr.fnt',
      scale: 0.0015,
      baseline: 'top',
      lineHeight: 90,
      text: buildText(this.system.scores),
      color: '#24caff'
    });
  }
});

function buildText (scores) {
  var text = '';
  scores.sort(function(a,b) {
    return parseInt(a.points) <= parseInt(b.points);
  }).forEach(function appendText (score) {
    name = score.name.toLowerCase();
    var score = score.points.toString();
    for (var i = 10; i <= 100; i *= 10) {
      if (score < i) score = '0' + score;
    }
    text += score.pad(7) + name + '\n';
  });
  return text;
}
