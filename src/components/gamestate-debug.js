/* globals AFRAME */
/**
 * Display entire game state as text.
 */
AFRAME.registerComponent('gamestate-debug', {
  init: function () {
    var el = this.el;
    var sceneEl = this.el.sceneEl;

    sceneEl.addEventListener('gamestate-initialized', setText);
    sceneEl.addEventListener('gamestate-changed', setText);

    function setText (evt) {
      el.setAttribute('bmfont-text', {text: buildText(evt.detail.state), color: '#DADADA'});
    }
  }
});

function buildText (state) {
  var text = 'DEBUG\n';
  Object.keys(state).sort().forEach(function appendText (property) {
    text += property + ': ' + state[property] + '\n';
  });
  return text;
}
