import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ParCoordsPlot from './ParCoords';
import ColorTag from '../../models/ColorTag';

const data01 = [
  [0, -0, 0, 0, 0, 1],
  [1, -1, 1, 2, 1, 1],
  [2, -2, 4, 4, 0.5, 1],
  [3, -3, 9, 6, 0.33, 1],
  [4, -4, 16, 8, 0.25, 1],
];

const foods = [
  { name: 'Asparagus', protein: 2.2, calcium: 0.024, sodium: 0.002 },
  { name: 'Butter', protein: 0.85, calcium: 0.024, sodium: 0.714 },
  { name: 'Coffeecake', protein: 6.8, calcium: 0.054, sodium: 0.351 },
  { name: 'Pork', protein: 28.5, calcium: 0.016, sodium: 0.056 },
  { name: 'Provolone', protein: 25.58, calcium: 0.756, sodium: 0.876 },
];

import data from './testdata/data-ex';
import bData from './testdata/response-ex';

const stories = storiesOf('ParCoord', module);

stories
  .add('empty bar chart', () => <ParCoordsPlot />)
  .add('with simple data', () => (
    <ParCoordsPlot
      data={foods}
      // mappings={{ n: 'n', bins: 'bins' }}
      // options={{ legendLocation: 'top_left' }}
      // onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with extent', () => (
    <ParCoordsPlot
      data={foods}
      options={{ extent: { width: 1000, height: 400 } }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with axes', () => (
    <ParCoordsPlot data={foods} axes={['name', 'protein']} />
  ))
  .add('with ColorTags', () => {
    const cTag = new ColorTag({
      color: 'red',
      itemIndices: [0, 1, 2],
    });
    return <ParCoordsPlot data={foods} colorTags={[cTag]} />;
  })
  .add('with selection', () => (
    <ParCoordsPlot
      data={foods}
      selectedIndices={[0, 1, 2]}
      onSelectedIndicesChange={action('selected_change')}
    />
  ));
// .add('with data durty', () => (
//   <ParCoordsPlot
//     data={data}
//     // mappings={{ n: 'n', bins: 'bins' }}
//     // options={{ legendLocation: 'top_left' }}
//     // onSelectedIndicesChange={action('selected_change')}
//   />
// ))
// .add('with bigger data', () => (
//   <ParCoordsPlot
//     data={bData.data}
//     onSelectedIndicesChange={action('selected_change')}
//   />
// ))
