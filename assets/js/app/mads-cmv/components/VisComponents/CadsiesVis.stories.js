/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'Cadsies - Custom Mini App' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Cadsies - Custom Mini App' is a visualization component that do amazing stuff.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, image test data, component Vis
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import Cadsies from './CadsiesVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------
const data = {data: [
  {
      index: 0,
      elemParam: '{"backgroundColor": "red", "width": "50px", "height": "50px", "text": ""}',
      objParam: '{"numericalValue": 42, "boolValue": false, "stringValue":"Welcome Dr. Falken"}'
  },
  {
      index: 1,
      elemParam: '{"backgroundColor": "blue", "width": "50px", "height": "50px", "fontSize": "11px", "text": "SECRET", "color": "yellow"}',
      objParam: '{}'
  },
  {
      index: 2,
      elemParam: '{"backgroundColor": "purple", "width": "50px", "height": "50px", "text": ""}',
      objParam: '{"numericalValue": 19, "boolValue": true, "stringValue":"Hoora!"}'
  },
]};

const options = {
  extent: {
    width: 98,
    height: 68,
  },
  extentUnit: {
    width: 'vw',
    height: 'vh',
  },
}

const options2 = {
  extent: {
    width: 98,
    height: 68,
  },
  extentUnit: {
    width: 'vw',
    height: 'vh',
  },
  enableDemoSampleData: true,
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('Cadsies', module);
stories
  .add('...Empty', () => <Cadsies />)
  .add('...With a few Cadsies', () => (
    <Cadsies
      data = { data }
      options = { options }
    />
  ))
  .add('...With demo data', () => (
    <Cadsies
      options = { options2 }
    />
  ));
  //-------------------------------------------------------------------------------------------------
