import React from 'react';
import { storiesOf } from '@storybook/react'; // eslint-disable-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import BarChart from './BarChart';
// import ColorTag from '../../models/ColorTag';

// import data from './testdata/data-ex';
// import bData from './testdata/response-ex';

const data0 = {
  fruits: ['Apples', 'Pears', 'Nectarines', 'Plums', 'Grapes', 'Strawberries'],
  2015: [2, 1, 4, 3, 2, 4],
  2016: [5, 3, 3, 2, 4, 6],
  2017: [3, 2, 4, 4, 5, 3],
};

const data02 = {
  fruits: ['Apples', 'Pears', 'Nectarines', 'Plums', 'Grapes', 'Strawberries'],
  2015: [2, 1, 4, 3, 2, 4],
  2016: [5, 3, 3, 2, 4, 6],
  2017: [3, 2, 4, 4, 5, 3],
  2018: [2, 1, 4, 3, 2, 4],
  2019: [5, 3, 3, 2, 4, 6],
};

const data1 = {
  features: [
    'Preparation',
    'Temperature',
    'ch4-pressure',
    'O2-pressure',
    'Contact-Times',
    'Cation1',
    'Cation1-mol',
    'Cation2',
    'Cation2-mol',
    'Cation3',
    'Cation3-mol',
    'Cation4',
    'Cation4-mol',
    'Anion1',
    'Anion1-mol',
    'Anion2',
    'Anion2-mol',
    'Support1',
    'Support1-mol',
    'Support2',
    'Support2-mol',
  ],
  importance: [
    0.039, 0.071275, 0.112966, 0.093391, 0.111855, 0.117603, 0.088582, 0.09848,
    0.098125, 0.023358, 0.031957, 0.005509, 0.007603, 0.031605, 0.028453,
    0.001644, 0.001437, 0.01384, 0.020769, 0.002134, 0.000415,
  ],
};

const data2 = {
  features: [
    'Preparation',
    'Temperature',
    'CH4-pressure',
    'O2-pressure',
    'Contact-times',
    'Cation1',
    'Cation1-mol',
    'Cation2',
    'Cation2-mol',
    'Support1',
    'Support1-mol',
  ],
  importance: [
    0.047685, 0.076804, 0.141382, 0.103445, 0.108693, 0.1314, 0.091595,
    0.123338, 0.125366, 0.021953, 0.02834,
  ],
};

const stories = storiesOf('BarChart', module);

stories
  .add('empty bar chart', () => <BarChart />)
  .add('with simple data specified with x axis', () => (
    <BarChart
      data={data0}
      mappings={{ dimension: 'fruits', measures: ['2015', '2016', '2017'] }}
      // mappings={{ dimension: 'fruits', measures: ['2017'] }}
      options={{ legendLocation: 'top_left' }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with simple data specified with x axis (2 measures)', () => (
    <BarChart
      data={data0}
      mappings={{ dimension: 'fruits', measures: ['2015', '2016'] }}
      // mappings={{ dimension: 'fruits', measures: ['2017'] }}
      options={{ legendLocation: 'top_left' }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with simple data specified with x axis (4 measures)', () => (
    <BarChart
      data={data02}
      mappings={{
        dimension: 'fruits',
        measures: ['2015', '2016', '2017', '2018'],
      }}
      // mappings={{ dimension: 'fruits', measures: ['2017'] }}
      options={{ legendLocation: 'top_left' }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with simple data (features)', () => (
    <BarChart
      data={data1}
      mappings={{ dimension: 'features', measures: ['importance'] }}
      // mappings={{ dimension: 'fruits', measures: ['2017'] }}
      options={{
        legendLocation: 'top_left',
        title: 'Feature Importance',
        extent: { width: 600, height: 400 },
        xaxis_orientation: 'vertical',
      }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with simple data (features2)', () => (
    <BarChart
      data={data2}
      mappings={{ dimension: 'features', measures: ['importance'] }}
      // mappings={{ dimension: 'fruits', measures: ['2017'] }}
      options={{
        legendLocation: 'top_left',
        title: 'Feature Importance',
        extent: { width: 600, height: 400 },
        xaxis_orientation: 'vertical',
      }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with simple data (features2) with barColor', () => (
    <BarChart
      data={data2}
      mappings={{ dimension: 'features', measures: ['importance'] }}
      // mappings={{ dimension: 'fruits', measures: ['2017'] }}
      options={{
        legendLocation: 'top_left',
        title: 'Feature Importance',
        extent: { width: 600, height: 400 },
        xaxis_orientation: 'vertical',
        barColors: ['red'],
      }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ));
// .add('with bigger data', () => (
//   <BarChart
//     data={bData.data}
//     mappings={{
//       x: 'Formation Energy (eV)',
//       y: 'Band Gap (eV)',
//     }}
//     onSelectedIndicesChange={action('selected_change')}
//   />
// ))
// .add('with selection', () => (
//   <BarChart
//     data={bData.data}
//     mappings={{
//       x: 'Formation Energy (eV)',
//       y: 'Band Gap (eV)',
//     }}
//     selectedIndices={[0, 1, 2]}
//     onSelectedIndicesChange={action('selected_change')}
//   />
// ))
// .add('with extent', () => (
//   <BarChart
//     data={bData.data}
//     mappings={{
//       x: 'Formation Energy (eV)',
//       y: 'Band Gap (eV)',
//     }}
//     extent={{ width: 800, height: 400 }}
//     onSelectedIndicesChange={action('selected_change')}
//   />
// ))
// .add('with ColorTags', () => {
//   const cTag = new ColorTag({
//     color: 'red',
//     itemIndices: [49, 16, 45, 47, 20, 11, 4, 13, 12, 14, 38, 27, 23, 51, 33],
//   });
//   return (
//     <BarChart
//       data={bData.data}
//       mappings={{
//         x: 'Formation Energy (eV)',
//         y: 'Band Gap (eV)',
//       }}
//       extent={{ width: 400, height: 400 }}
//       colorTags={[cTag]}
//     />
//   );
// })
// .add('with color column', () => (
//   <BarChart
//     data={bData.data}
//     mappings={{
//       x: 'Formation Energy (eV)',
//       y: 'Band Gap (eV)',
//       color: 'Band Gap (eV)',
//     }}
//     extent={{ width: 400, height: 400 }}
//   />
// ))
// .add('with knobs', () => {
//   // const defaultExtent = { width: 400, height: 400 };
//   // const groupId = 'GROUP-ID1';
//   // const extent = object('extent', defaultExtent);
//   // const width = number('width', 400);
//   // const height = number('height', 400);

//   const selections = array('selectedIndices', [0]).map(Number);

//   return (
//     <BarChart
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
