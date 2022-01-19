/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'LineChart' module
// ------------------------------------------------------------------------------------------------
// Notes: 'LineChart' is a visualization component that displays a classic line chart in numerous
//        ways based on a range of available properties, and is rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, LineChart VizComp
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import LineChart from './LineChart';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------

// Simple Test Data
//=========================================
const originalTestData = {
  data: [
    { time: '06:00', temp: -20, },
    { time: '07:00', temp: -15, },
    { time: '08:00', temp: -10, },
    { time: '09:00', temp: -16, },
    { time: '10:00', temp: -5, },
    { time: '11:00', temp: 0, },
    { time: '12:00', temp: 10, },
    { time: '13:00', temp: 5, },
    { time: '14:00', temp: 10, },
    { time: '15:00', temp: 25, },
    { time: '16:00', temp: 30, },
    { time: '17:00', temp: 20, },
    { time: '18:00', temp: 5, },
    { time: '19:00', temp: 10, },
    { time: '20:00', temp: 15, },
    { time: '21:00', temp: 7, },
  ],
};
const time = [];
const temp = [];

originalTestData.data.forEach((row, index) => {
  time.push(row.time);
  temp.push(row.temp);
});

const osData =  { time, temp }
const osMappings = { xData: 'time', yData: 'temp' };

const osOptions = {
  extent: { width: 600, height: 400 },
  title: 'Temperature inside the lab during the day of 2021-09-12',
  legendLabel: "Temp",
  axisLabels: ['Time', 'Temperature'],
};
//=========================================

// Simple Test Multiple Data
//=========================================
let extras = [ [], [], [] ];
let osmData =  { ...osData };
extras.forEach(xt => {
  for(var i = 0; i < temp.length; i++){
    xt.push(Math.ceil(Math.random() * 20) * (Math.round(Math.random()) ? 1 : -1));
  }
  osmData[xt] = xt;
});

const osmOptions = { ...osOptions, ...{title: 'Temperature inside the lab during the week', legendLabel: 'Day', lineDash: ["solid", "dashed", "dotted", "dotdash"]}};
//=========================================

// Sine Curve Data
//=========================================
export function getLineCurveDataPack(){
  let xData = [], yData = [];
  var increase = 90 / 180 * Math.PI / 9;
  var counter = 0;
  for(var i = 0; i <= 360; i += 10){
    xData.push(i);
    yData.push(180 - Math.sin(counter) * 120);
    counter += increase;
  }
  let data = { xData, yData };

  const options = {
    extent: { width: 600, height: 400 },
    title: 'A Sin(x) Curve',
    axisLabels: ['X', 'Sin(X)'],
    legendLabel: "Sine",
  };
  return { data, options };
}
const SCDPack = getLineCurveDataPack();
//=========================================

// Chemical Sample Data
//=========================================
const cData = { xData: [], yData: [] };
cData.xData = [0, 20, 40, 60, 80, 100];
cData.yData = [3.3, 7.3, 13.9, 23.8, 37.5, 56.3];

const cOptions = {
  extent: { width: 600, height: 400 },
  title: 'Solubility of Potassium Chlorate',
  legendLabel: "grams of potassium chlorate / 100 mL water",
  axisLabels: ['Temperature (°C)', 'Solubility (g/100 mL H2O)'],
};
//=========================================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('LineChart', module);
stories
  .add('...empty', () => <LineChart />)
  .add('...with small data', () => (
    <LineChart
      data = { osData }
      mappings={ osMappings }
      options = { osOptions }
    />
  ))
  .add('...with small multiple data', () => (
    <LineChart
      data = { osmData }
      mappings={ osMappings }
      options = { osmOptions }
    />
  ))
  .add('...with a sin(x) curve data', () => (
    <LineChart
      data = { SCDPack.data }
      options = { SCDPack.options }
    />
  ))
  .add('...with small chemical data', () => (
    <LineChart
       data = {cData}
       options = { cOptions }
    />
  ));
  //-------------------------------------------------------------------------------------------------
