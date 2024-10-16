/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'Scatter3D' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Scatter3D' is a visualization component that displays a classic 3D Scatter Plot in
//        various ways based on a range of available properties, and is rendered with the help of the
//        Plotly library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, 3rd party lodash, Scatter3D VizComp
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import _ from 'lodash';

import NetworkAnalysis from './NetworkAnalysisVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------

// Simple Test Data
//=========================================
const originalTestData = {
  data: [
    { x: 7,   y: 3,   z: 9,   gr: 4, },
    { x: 3,   y: 5,   z: 7,   gr: 2,  },
    { x: 5,   y: 1,   z: 5,   gr: 4,  },
    { x: 8,   y: 1,   z: 4,   gr: 3,  },
    { x: 1,   y: 8,   z: 3,   gr: 1,  },
    { x: 5,   y: 9,   z: 0,   gr: 1,  },
    { x: 7,   y: 0,   z: 1,   gr: 3,  },
    { x: 9,   y: 2,   z: 2,   gr: 3,  },
    { x: 0,   y: 5,   z: 6,   gr: 2,  },
    { x: 2,   y: 6,   z: 4,   gr: 4,  },
  ]
};

originalTestData.data.sort(function(a, b) {
  return a.gr - b.gr;
});

const x = [], y = [], z = [], gr = [];
originalTestData.data.forEach(item => {
  x.push(item.x);
  y.push(item.y);
  z.push(item.z);
  gr.push(item.gr);
});
const data =  { x, y, z, gr };
const opts = {
  colorMap: "Category10",
};
//=========================================

// Small File Sample Data
//=========================================
import iris_data from './testdata/iris';
export function getScatter3DDataPack(){
  const ix = [], iy = [], iz = [], mSize = [], mCol = [], mClass = [];
  iris_data.data.forEach(item => {
    ix.push(item['petal length']);
    iy.push(item['petal width']);
    iz.push(item['sepal length']);
    mSize.push(item['petal length']*2);
    mClass.push(item['class']);
  });
  const data = { x: ix, y: iy, z: iz, gr: mClass };
  const options = {
    axisTitles: ['Petal Length (cm)', 'Petal Width (cm)', 'Sepal Length (cm)'],
    title: "Iris Dataset",
    marker: {
      size: mSize,
      opacity: 0.8,
    },
    extent: { width: 700, height: 500 },
    camera: {
      eye: {x: 1.4812613804078045, y: 1.985359929383866, z: 1.453572100630214},
      up: {x: 0, y: 0, z: 1},
    },
    colorMap: "Category10",
  };

  return {data, options};
}
const S3DDPack = getScatter3DDataPack();
//=========================================

// Numeric Chem File Data
//=========================================
import numericchemdata from './testdata/chem';
const cx = [], cy = [], cz = [], cSize = [], cCol = [], cGroup = [];
numericchemdata.data.forEach(item => {
  cx.push(item['Temperature']);
  cy.push(item['ch4-pressure']);
  cz.push(item['O2-pressure']);
  cSize.push(item['C2-yield']);
  cGroup.push(item['CH4-Conversion%']);
});
const cData = { x: cx, y: cy, z: cz, gr: cGroup };
const cData_options = {
  axisTitles: ['Temperature (°C)', 'ch4-pressure (Pa)', 'O2-pressure (Pa)'],
  title: "Chemical Data",
  marker: {
    size: cSize,
    opacity: 0.8,
  },
};
//=========================================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('Scatter3D', module);
stories
  .add('...empty', () => <Scatter3D />)
  .add('...with small data', () => (
    <NetworkAnalysis
      data = { data }
      options = { opts }
    />
  ))
  .add('...with file data', () => (
    <NetworkAnalysis
       data = { S3DDPack.data }
       options = { S3DDPack.options }
    />
  ))
  .add('...with Large numerical chem data', () => (
    <NetworkAnalysis
       data = {cData}
       options = { cData_options }
    />
  ));
//-------------------------------------------------------------------------------------------------
