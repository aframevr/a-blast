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
    console.log(this.scores.length, this.data.maxScores, this.scores, data);
    return (this.scores.length < this.data.maxScores ||
      this.scores[this.scores.length - 1].points < data.points);
  },

  addNewScore: function (data) {
    // Check if we need to insert it
    if (this.shouldStoreScore(data)) {
      this.scores.push(data);

      this.scores.sort(function(a,b) {
        return a.points <= b.points;
      });

      if (this.scores.length > this.data.maxScores) {
        this.scores.pop();
      }

      localStorage['highscores'] = JSON.stringify(this.scores);
      return true;
    }
    return false;
  }
});

AFRAME.registerComponent('highscores', {
  schema: {},

  init: function () {
    var el = this.el;
    var sceneEl = this.el.sceneEl;

    el.setAttribute('bmfont-text', {text: buildText(this.system.scores), color: '#DADADA'});
  }
});

function buildText (scores) {
  var text = 'HIGH-SCORES\n-------------\n';
  scores.forEach(function appendText (score) {
    var len = 10;
    name = score.name.pad(7).toLowerCase();
    var score = score.points.toString().pad(5,true);
    text += name + ' ' + score + '\n';
  });
  return text;
}
