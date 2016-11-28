/* globals AFRAME ASHOOTER THREE */
AFRAME.registerSystem('highscores', {
  schema: {
    maxScores: {default: 10},
  },

  init: function () {
    if (!this.isLocalStorageSupported()) {
      console.warn('Highscore can\'t be loaded or saved as no localStorage support found!');
      return;
    }

    this.scores = [];
    if (localStorage['highscores']) {
      this.scores = JSON.parse(localStorage['highscores']);
    }

    var self = this;
    this.sceneEl.addEventListener('gamestate-changed', function (evt) {
      if ('state' in evt.detail.diff) {
        switch (evt.detail.state.state) {
          case 'STATE_GAME_OVER':
          case 'STATE_GAME_WIN':
        }
      }
    });
  },

  isLocalStorageSupported: function ()
  {
    try {
    	return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  },

  addNewScore: function (data) {
    // Check if we need to insert it
    if (this.scores.length < this.numScores ||
      this.scores[this.scores.length - 1].score < data.score) {
      this.scores.push(data);

      this.scores.sort(function(a,b) {
        return a.score <= b.score;
      });

      if (this.scores.length > this.numScores) {
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
    var score = score.score.toString().pad(5,true);
    text += name + ' ' + score + '\n';
  });
  return text;
}
