import { addParameters, configure } from '@storybook/react';



addParameters({
  options: {
    panelPosition: 'right',
  }
});

const req = require.context('../assets/js/app/mads-cmv/components', true, /\.stories\.js$/)

function loadStories() {

  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module);
