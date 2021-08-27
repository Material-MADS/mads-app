import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import _ from 'lodash';

import Scatter3D from './Scatter3D';

// Simple Test Data - SETUP BEGIN
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
// Simple Test Data - SETUP END


// Small File Sample Data - SETUP BEGIN
//=========================================
import iris_data from './testdata/iris';
const ix = [], iy = [], iz = [], mSize = [], mCol = [], mClass = [];
iris_data.data.forEach(item => {
  ix.push(item['petal length']);
  iy.push(item['petal width']);
  iz.push(item['sepal length']);
  mSize.push(item['petal length']*2);
  mClass.push(item['class']);
});
const iData = { x: ix, y: iy, z: iz, gr: mClass };
const iris_options = {
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
//=========================================
// Small File Sample Data - SETUP END


// Numeric Chem File Data - SETUP BEGIN
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
// Numeric Chem File Data - SETUP END


const stories = storiesOf('Scatter3D', module);

stories
  .add('...empty', () => <Scatter3D />)
  .add('...with small data', () => (
    <Scatter3D
      data = { data }
      options = { opts }
    />
  ))
  .add('...with file data', () => (
    <Scatter3D
       data = { iData }
       options = { iris_options }
    />
  ))
  .add('...with Large numerical chem data', () => (
    <Scatter3D
       data = {cData}
       options = { cData_options }
    />
  ));
