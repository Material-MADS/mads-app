import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import QuadBarChart from './QuadBarChart';

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

const histData01 = {
  n: [1, 10, 63, 190, 262, 272, 149, 43, 7, 3],
  bins: [
    11.9497944, 19.68161764, 27.41344088, 35.14526412, 42.87708736, 50.6089106,
    58.34073384, 66.07255707, 73.80438031, 81.53620355, 89.26802679,
  ],
};

const stories = storiesOf('QuadBarChart', module);

stories
  .add('empty bar chart', () => <QuadBarChart />)
  .add('with simple data', () => (
    <QuadBarChart
      data={histData01}
      mappings={{ n: 'n', bins: 'bins' }}
      // options={{ legendLocation: 'top_left' }}
      // onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with simple data color tags', () => (
    <QuadBarChart data={histData01} mappings={{ n: 'n', bins: 'bins' }} />
  ))
  .add('with simple data specified with x axis (4 measures)', () => (
    <QuadBarChart
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
    <QuadBarChart
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
    <QuadBarChart
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
  ));
