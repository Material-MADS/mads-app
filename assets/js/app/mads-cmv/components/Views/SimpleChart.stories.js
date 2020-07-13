import React from 'react';
import { storiesOf } from '@storybook/react'; // eslint-disable-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies
// import { // eslint-disable-line import/no-extraneous-dependencies
//   withKnobs, array,
// } from '@storybook/addon-knobs';

import SimpleChart from './SimpleChart';

const data0 = {
  fruits: ['Apples', 'Pears', 'Nectarines', 'Plums', 'Grapes', 'Strawberries'],
  2015: [2, 1, 4, 3, 2, 4],
  2016: [5, 3, 3, 2, 4, 6],
  2017: [3, 2, 4, 4, 5, 3],
};

const stories = storiesOf('SimpleChart', module);
// stories.addDecorator(withKnobs);

stories.add('without settings', () => (
  <SimpleChart
    id="1"
    chartSettings={{ type: 'Scatter' }}
    removeView={() => console.log('remove')}
  />
));
