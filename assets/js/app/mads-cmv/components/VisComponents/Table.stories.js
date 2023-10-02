/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'Table' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Table' is a visualization component that displays a classic Table, rendered with the
//        Bokeh library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, Table VizComp and ColorTag. External sample data.
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Table from './Table';
import ColorTag from '../../models/ColorTag';

import data from './testdata/data-ex';
import bData from './testdata/response-ex';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('Table', module);
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
  ));
//-------------------------------------------------------------------------------------------------
