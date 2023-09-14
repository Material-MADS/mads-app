/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'StatisticsVis' module
// ------------------------------------------------------------------------------------------------
// Notes: 'StatisticsVis' is a visualization component that displays a classic Table, rendered with the
//        Bokeh library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, StatisticsVis VizComp and ColorTag. External sample data.
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import StatisticsVis from './StatisticsVis';

//-------------------------------------------------------------------------------------------------

const testData = {
  "columns": [ "Stats", "CHAS", "NOX", "AGE" ],
  "data": [
      {
          "Stats": "count",
          "CHAS": 506,
          "NOX": 506,
          "AGE": 506
      },
      {
          "Stats": "mean",
          "CHAS": 0.06917,
          "NOX": 0.5547,
          "AGE": 68.5749
      },
      {
          "Stats": "std",
          "CHAS": 0.25399,
          "NOX": 0.11588,
          "AGE": 28.14886
      },
      {
          "Stats": "min",
          "CHAS": 0,
          "NOX": 0.385,
          "AGE": 2.9
      },
      {
          "Stats": "25%",
          "CHAS": 0,
          "NOX": 0.449,
          "AGE": 45.025
      },
      {
          "Stats": "50%",
          "CHAS": 0,
          "NOX": 0.538,
          "AGE": 77.5
      },
      {
          "Stats": "75%",
          "CHAS": 0,
          "NOX": 0.624,
          "AGE": 94.075
      },
      {
          "Stats": "max",
          "CHAS": 1,
          "NOX": 0.871,
          "AGE": 100
      }
  ]
};
//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('StatisticsVis', module);
stories
  .add('empty table', () => <StatisticsVis />)
  .add('with data', () => (
    <StatisticsVis
      data={testData}
    />
  ));
//-------------------------------------------------------------------------------------------------
