import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, array } from '@storybook/addon-knobs';

import Table from './Table';
import ColorTag from '../../models/ColorTag';

import data from './testdata/data-ex';
import bData from './testdata/response-ex';

const stories = storiesOf('Table', module);
stories.addDecorator(withKnobs);

stories
  .add('empty table', () => <Table />)
  .add('with data', () => (
    <Table data={data} onSelectedIndicesChange={action('selected_change')} />
  ))
  .add('with bigger data', () => (
    <Table
      data={bData.data}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with selection', () => (
    <Table
      data={bData.data}
      selectedIndices={[0, 1, 2]}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with extent', () => (
    <Table
      data={bData.data}
      options={{ extent: { width: 400, height: 400 } }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with ColorTags', () => {
    const cTag = new ColorTag({
      color: 'red',
      itemIndices: [49, 16, 45, 47, 20, 11, 4, 13, 12, 14, 38, 27, 23, 51, 33],
    });
    return <Table data={bData.data} colorTags={[cTag]} />;
  })
  .add('with columns', () => (
    <Table
      data={bData.data}
      columns={['Formation Energy (eV)', 'Band Gap (eV)', 'Volume']}
    />
  ))
  .add('with knobs', () => {
    // const defaultExtent = { width: 400, height: 400 };
    // const groupId = 'GROUP-ID1';
    // const extent = object('extent', defaultExtent);
    // const width = number('width', 400);
    // const height = number('height', 400);

    const selections = array('selectedIndices', [0]).map(Number);

    return (
      <Table
        data={bData.data}
        // extent={{ width, height }}
        selectedIndices={selections}
        // onSelectedIndicesChange={action('selected_change')}
      />
    );
  });
