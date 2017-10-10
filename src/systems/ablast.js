AFRAME.registerSystem('a-blast', {
  schema: {},

  init: function () {
    var mappings = {
      default: {
        'vive-controls': {
          triggerdown: 'shoot'
        },
        'oculus-touch-controls': {
          triggerdown: 'shoot'
        },
        'windows-motion-controls': {
          triggerdown: 'shoot'
        },
        keyboard: {
          'space_down': 'shootScreen'
        }
      }
    };
    AFRAME.registerInputMappings(mappings);
  }
});
