import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import HeatMap from './HeatMap';

// Simple Test Data - SETUP BEGIN
//=========================================
const originalTestData = {
  data: [
    { time: '00:00-06:00', season: 'Winter', temp: -20, },
    { time: '06:00-12:00', season: 'Winter', temp: -15, },
    { time: '12:00-18:00', season: 'Winter', temp: -10, },
    { time: '18:00-00:00', season: 'Winter', temp: -16, },
    { time: '00:00-06:00', season: 'Spring', temp: -5, },
    { time: '06:00-12:00', season: 'Spring', temp: 0, },
    { time: '12:00-18:00', season: 'Spring', temp: 10, },
    { time: '18:00-00:00', season: 'Spring', temp: 5, },
    { time: '00:00-06:00', season: 'Summer', temp: 10, },
    { time: '06:00-12:00', season: 'Summer', temp: 25, },
    { time: '12:00-18:00', season: 'Summer', temp: 30, },
    { time: '18:00-00:00', season: 'Summer', temp: 20, },
    { time: '00:00-06:00', season: 'Autumn', temp: 5, },
    { time: '06:00-12:00', season: 'Autumn', temp: 10, },
    { time: '12:00-18:00', season: 'Autumn', temp: 15, },
    { time: '18:00-00:00', season: 'Autumn', temp: 7, },
  ]
};
const season = [];
const time = [];
const temp = [];

originalTestData.data.forEach((row, index) => {
  season.push(row.season);
  time.push(row.time);
  temp.push(row.temp);
});

const osXRange = season.filter((v, i, a) => a.indexOf(v) === i);
const osYRange = time.filter((v, i, a) => a.indexOf(v) === i);
const osData =  { season, time, temp }

const osOptions = {
  x_range: osXRange,
  y_range: osYRange.reverse(),
  toolTipTitles: ['Time', 'Temperature'],
  heatValUnit: '°',
  colorMap: 'Viridis',
  extent: { width: 600, height: 400 },
  title: `Average Temperature during the year`,
  fontSize: '10px',
};
//=========================================
// Simple Test Data - SETUP END

// Small File Sample Data - SETUP BEGIN
//=========================================
import sampleFileData from './testdata/unemployment';
export function getHeatMapDataPack(){
  let data = { xData: [], yData: [], heatVal: [] };
  let sfXRange = [], yRange = [];
  sampleFileData.forEach((row, index) => {
    delete row.Annual;
    sfXRange.push(row.Year + '');
    for (let col in row) {
      if(col != 'Year'){
        data.xData.push(row.Year + '');
        data.yData.push(col + '');
        data.heatVal.push(row[col]);
        if(index == 0){ yRange.push(col); }
      }
    }
  });

  const options = {
    x_range: sfXRange,
    y_range: yRange.reverse(),
    toolTipTitles: ['Date', 'Rate'],
    heatValUnit: '%%',
    colors: ["#75968f", "#a5bab7", "#c9d9d3", "#e2e2e2", "#dfccce", "#ddb7b1", "#cc7878", "#933b41", "#550b1d"],
    extent: { width: 900, height: 400 },
    title: `US Unemployment (${sfXRange[0]} - ${sfXRange[sfXRange.length-1]})`
  };

  return { data, options };
}
const SFSDPack = getHeatMapDataPack(sampleFileData);
//=========================================
// Small File Sample Data - SETUP END

// Chemical File Sample Data - SETUP BEGIN
//=========================================
import chemData from './testdata/chem';
const cData = { xData: [], yData: [], heatVal: [] };
chemData.data.forEach(item => {
  cData.xData.push(item.Temperature + '');
  cData.yData.push(item.Preparation + '');
  cData.heatVal.push(item['C2-yield']);
});
const cXRange = (cData.xData.filter((v, i, a) => a.indexOf(v) === i)).sort().reverse();
const cYRange = (cData.yData.filter((v, i, a) => a.indexOf(v) === i)).sort().reverse();

const cOptions = {
  x_range: cXRange,
  y_range: cYRange,
  toolTipTitles: ['Temperature', 'Preparation', 'C2 Yield'],
  colorMap: 'Magma',
  heatValUnit: '%%',
  extent: { width: 1200, height: 400 },
  title: `C2 Yield for for various reactions with  specific temperature and preparation methods`,
};
//=========================================
// Chemical File Sample Data - SETUP END

const stories = storiesOf('HeatMap', module);

stories
  .add('...empty', () => <HeatMap />)
  .add('...with small data', () => (
    <HeatMap
      data = { osData }
      mappings={{ xData: 'season', yData: 'time', heatVal: 'temp' }}
      options = { osOptions }
    />
  ))
  .add('...with file data', () => (
    <HeatMap
      data = { SFSDPack.data }
      options = { SFSDPack.options }
    />
  ))
  .add('...with chem data', () => (
    <HeatMap
       data = {cData}
       options = { cOptions }
    />
  ));
