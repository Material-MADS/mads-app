import React from 'react';
import { storiesOf } from '@storybook/react'; // eslint-disable-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import Scatter from './Scatter';
import ColorTag from '../../models/ColorTag';

import data from './testdata/data-ex';
import bData from './testdata/response-ex';
import data2 from './testdata/chem';

const stories = storiesOf('Scatter', module);

stories
  .add('empty scatter plot', () => <Scatter />)
  .add('with data', () => (
    <Scatter
      data={data}
      mappings={{
        x: 'Formation Energy (eV)',
        y: 'Band Gap (eV)',
      }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with bigger data', () => (
    <Scatter
      data={bData.data}
      mappings={{
        x: 'Formation Energy (eV)',
        y: 'Band Gap (eV)',
      }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with selection', () => (
    <Scatter
      data={bData.data}
      mappings={{
        x: 'Formation Energy (eV)',
        y: 'Band Gap (eV)',
      }}
      selectedIndices={[0, 1, 2]}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with extent', () => (
    <Scatter
      data={bData.data}
      mappings={{
        x: 'Formation Energy (eV)',
        y: 'Band Gap (eV)',
      }}
      options={{ extent: { width: 800, height: 400 } }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with ColorTags', () => {
    const cTag = new ColorTag({
      color: 'red',
      itemIndices: [49, 16, 45, 47, 20, 11, 4, 13, 12, 14, 38, 27, 23, 51, 33],
    });
    return (
      <Scatter
        data={bData.data}
        mappings={{
          x: 'Formation Energy (eV)',
          y: 'Band Gap (eV)',
        }}
        options={{ extent: { width: 400, height: 400 } }}
        colorTags={[cTag]}
      />
    );
  })
  .add('with color column', () => (
    <Scatter
      data={bData.data}
      mappings={{
        x: 'Formation Energy (eV)',
        y: 'Band Gap (eV)',
        color: 'Band Gap (eV)',
      }}
      options={{ extent: { width: 400, height: 400 } }}
    />
  ))
  .add('with color column 2', () => (
    <Scatter
      data={data2.data}
      mappings={{
        x: 'CH4-Conversion%',
        y: 'C2-selectivity',
        color: 'C2-yield',
      }}
      options={{ extent: { width: 400, height: 400 } }}
    />
  ));
// .add('with knobs', () => {
//   // const defaultExtent = { width: 400, height: 400 };
//   // const groupId = 'GROUP-ID1';
//   // const extent = object('extent', defaultExtent);
//   // const width = number('width', 400);
//   // const height = number('height', 400);

//   const selections = array('selectedIndices', [0]).map(Number);

//   return (
//     <Scatter
//       data={bData.data}
//       mappings={{
//         x: 'Formation Energy (eV)',
//         y: 'Band Gap (eV)',
//       }}
//       // extent={{ width, height }}
//       selectedIndices={selections}
//       // onSelectedIndicesChange={action('selected_change')}
//     />
//   );
// });
