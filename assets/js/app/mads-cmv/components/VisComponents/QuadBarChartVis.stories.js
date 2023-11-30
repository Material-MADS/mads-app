/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'QuadBarChart' module
// ------------------------------------------------------------------------------------------------
// Notes: 'QuadBarChart' is a visualization component that displays a type of bar chart
//        based on a range of available properties, and is rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, QuadBarChart VizComp
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import QuadBarChart from './QuadBarChartVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------

// 'with simple data'
//=========================================
export function getQuadBarDataPack(){
  const data = {
    hist: [1, 10, 63, 190, 262, 272, 149, 43, 7, 3],
    binEdges: [
      11.9497944, 19.68161764, 27.41344088, 35.14526412, 42.87708736, 50.6089106,
      58.34073384, 66.07255707, 73.80438031, 81.53620355, 89.26802679,
    ],
    indices: []
  };

  const mappings = { n: 'hist', bins: 'binEdges' };

  return {data, mappings};
}
const QBDPack = getQuadBarDataPack();

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('QuadBarChart', module);
stories
  .add('empty bar chart', () => <QuadBarChart />
);
//-------------------------------------------------------------------------------------------------
