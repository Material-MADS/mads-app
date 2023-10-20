/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'GapMinder' module
// ------------------------------------------------------------------------------------------------
// Notes: 'GapMinder' is a visualization component that displays a classic GapMinder visualization
//        based on a range of available properties, and is rendered with the help of the
//        ??? library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, 3rd party lodash, Scatter3D VizComp
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import _ from 'lodash';

import GapMinder from './GapMinderVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------

// Small File Sample Data
//=========================================
import gmData from './testdata/gapMinderSubData';
// export function getHeatMapDataPack(){
//   let data = { xData: [], yData: [], heatVal: [] };
//   let sfXRange = [], yRange = [];
//   sampleFileData.forEach((row, index) => {
//     delete row.Annual;
//     sfXRange.push(row.Year + '');
//     for (let col in row) {
//       if(col != 'Year'){
//         data.xData.push(row.Year + '');
//         data.yData.push(col + '');
//         data.heatVal.push(row[col]);
//         if(index == 0){ yRange.push(col); }
//       }
//     }
//   });

//   const options = {
//     x_range: sfXRange,
//     y_range: yRange.reverse(),
//     toolTipTitles: ['Date', 'Rate'],
//     heatValUnit: '%%',
//     colors: ["#75968f", "#a5bab7", "#c9d9d3", "#e2e2e2", "#dfccce", "#ddb7b1", "#cc7878", "#933b41", "#550b1d"],
//     extent: { width: 900, height: 400 },
//     title: `US Unemployment (${sfXRange[0]} - ${sfXRange[sfXRange.length-1]})`
//   };

//   return { data, options };
// }
const theData = gmData;
const theOptions = {
    // x_range: sfXRange,
    // y_range: yRange.reverse(),
    // toolTipTitles: ['Date', 'Rate'],
    // heatValUnit: '%%',
    // colors: ["#75968f", "#a5bab7", "#c9d9d3", "#e2e2e2", "#dfccce", "#ddb7b1", "#cc7878", "#933b41", "#550b1d"],
    // extent: { width: 900, height: 400 },
    // title: `US Unemployment (${sfXRange[0]} - ${sfXRange[sfXRange.length-1]})`
  };
//=========================================


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('GapMinder', module);
stories
  .add('...empty', () => <GapMinder />)
  .add('...with file data', () => (
    <GapMinder
       data = { theData }
       options = { theOptions }
    />
  ));
//-------------------------------------------------------------------------------------------------
