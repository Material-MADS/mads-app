/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'BarChart' module
// ------------------------------------------------------------------------------------------------
// Notes: 'BarChart' is a visualization component that displays a classic bar chart in numerous
//        ways based on a range of available properties, and is rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, Scatter VizComp and ColorTag. Various TestData
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react'; // eslint-disable-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import Scatter from './Scatter';
import ColorTag from '../../models/ColorTag';

import data from './testdata/data-ex';
import bData from './testdata/response-ex';
import data2 from './testdata/chem';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------

// 'with bigger data'
//=========================================
export function getScatterDataPack(){
  const data = bData.data;
  const mappings = {
    x: 'Formation Energy (eV)',
    y: 'Band Gap (eV)',
  };
  const onSelectedIndicesChange = action('selected_change');

  return {data, mappings, onSelectedIndicesChange};
}
const SDPack = getScatterDataPack();

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('Scatter', module);
stories
  .add('empty scatter plot', () => <Scatter />)
  .add('with data', () => {
    const cTag = new ColorTag({
      color: 'red',
      itemIndices: [0, 10],
    });
    return (
      <Scatter
        data={data}
        mappings={{
          x: 'Formation Energy (eV)',
          y: 'Band Gap (eV)',
        }}
        onSelectedIndicesChange={action('selected_change')}
        colorTags={[cTag]}
      />
    );
  })
  // .add('with data', () => (
  //   <Scatter
  //     data={data}

  //     mappings={{
  //       x: 'Formation Energy (eV)',
  //       y: 'Band Gap (eV)',
  //     }}
  //     onSelectedIndicesChange={action('selected_change')}
  //   />
  // ))
  .add('with bigger data', () => (
    <Scatter
      data = { SDPack.data }
      mappings = { SDPack.mappings }
      onSelectedIndicesChange = { SDPack.onSelectedIndicesChange }
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
//-------------------------------------------------------------------------------------------------
