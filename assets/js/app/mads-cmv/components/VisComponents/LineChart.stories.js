import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import LineChart from './LineChart';

// Simple Test Data - SETUP BEGIN
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
// Simple Test Data - SETUP END

// Simple Test Multiple Data - SETUP BEGIN
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
// Simple Test Multiple Data - SETUP END

// Sine Curve Data - SETUP BEGIN
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
// Sine Curve Data - SETUP END

// Chemical Sample Data - SETUP BEGIN
//=========================================
import chemData from './testdata/chem';
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
// Chemical Sample Data - SETUP END

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
  .add('...with chem data', () => (
    <LineChart
       data = {cData}
       options = { cOptions }
    />
  ));
