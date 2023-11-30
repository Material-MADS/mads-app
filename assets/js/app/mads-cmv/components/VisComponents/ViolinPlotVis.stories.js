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

import ViolinPlotVis from './ViolinPlotVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------

// Simple Test Data
//=========================================
const data = {data: [
  {
      "index": 0,
      "total_bill": 16.99,
      "tip": 1.01,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 1,
      "total_bill": 10.34,
      "tip": 1.66,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 2,
      "total_bill": 21.01,
      "tip": 3.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 3,
      "total_bill": 23.68,
      "tip": 3.31,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 4,
      "total_bill": 24.59,
      "tip": 3.61,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 5,
      "total_bill": 25.29,
      "tip": 4.71,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 6,
      "total_bill": 8.77,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 7,
      "total_bill": 26.88,
      "tip": 3.12,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 8,
      "total_bill": 15.04,
      "tip": 1.96,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 9,
      "total_bill": 14.78,
      "tip": 3.23,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 10,
      "total_bill": 10.27,
      "tip": 1.71,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 11,
      "total_bill": 35.26,
      "tip": 5,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 12,
      "total_bill": 15.42,
      "tip": 1.57,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 13,
      "total_bill": 18.43,
      "tip": 3,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 14,
      "total_bill": 14.83,
      "tip": 3.02,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 15,
      "total_bill": 21.58,
      "tip": 3.92,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 16,
      "total_bill": 10.33,
      "tip": 1.67,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 17,
      "total_bill": 16.29,
      "tip": 3.71,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 18,
      "total_bill": 16.97,
      "tip": 3.5,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 19,
      "total_bill": 20.65,
      "tip": 3.35,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 20,
      "total_bill": 17.92,
      "tip": 4.08,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 21,
      "total_bill": 20.29,
      "tip": 2.75,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 22,
      "total_bill": 15.77,
      "tip": 2.23,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 23,
      "total_bill": 39.42,
      "tip": 7.58,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 24,
      "total_bill": 19.82,
      "tip": 3.18,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 25,
      "total_bill": 17.81,
      "tip": 2.34,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 26,
      "total_bill": 13.37,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 27,
      "total_bill": 12.69,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 28,
      "total_bill": 21.7,
      "tip": 4.3,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 29,
      "total_bill": 19.65,
      "tip": 3,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 30,
      "total_bill": 9.55,
      "tip": 1.45,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 31,
      "total_bill": 18.35,
      "tip": 2.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 32,
      "total_bill": 15.06,
      "tip": 3,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 33,
      "total_bill": 20.69,
      "tip": 2.45,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 34,
      "total_bill": 17.78,
      "tip": 3.27,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 35,
      "total_bill": 24.06,
      "tip": 3.6,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 36,
      "total_bill": 16.31,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 37,
      "total_bill": 16.93,
      "tip": 3.07,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 38,
      "total_bill": 18.69,
      "tip": 2.31,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 39,
      "total_bill": 31.27,
      "tip": 5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 40,
      "total_bill": 16.04,
      "tip": 2.24,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 41,
      "total_bill": 17.46,
      "tip": 2.54,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 42,
      "total_bill": 13.94,
      "tip": 3.06,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 43,
      "total_bill": 9.68,
      "tip": 1.32,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 44,
      "total_bill": 30.4,
      "tip": 5.6,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 45,
      "total_bill": 18.29,
      "tip": 3,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 46,
      "total_bill": 22.23,
      "tip": 5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 47,
      "total_bill": 32.4,
      "tip": 6,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 48,
      "total_bill": 28.55,
      "tip": 2.05,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 49,
      "total_bill": 18.04,
      "tip": 3,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 50,
      "total_bill": 12.54,
      "tip": 2.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 51,
      "total_bill": 10.29,
      "tip": 2.6,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 52,
      "total_bill": 34.81,
      "tip": 5.2,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 53,
      "total_bill": 9.94,
      "tip": 1.56,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 54,
      "total_bill": 25.56,
      "tip": 4.34,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 55,
      "total_bill": 19.49,
      "tip": 3.51,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 56,
      "total_bill": 38.01,
      "tip": 3,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 57,
      "total_bill": 26.41,
      "tip": 1.5,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 58,
      "total_bill": 11.24,
      "tip": 1.76,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 59,
      "total_bill": 48.27,
      "tip": 6.73,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 60,
      "total_bill": 20.29,
      "tip": 3.21,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 61,
      "total_bill": 13.81,
      "tip": 2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 62,
      "total_bill": 11.02,
      "tip": 1.98,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 63,
      "total_bill": 18.29,
      "tip": 3.76,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 64,
      "total_bill": 17.59,
      "tip": 2.64,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 65,
      "total_bill": 20.08,
      "tip": 3.15,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 66,
      "total_bill": 16.45,
      "tip": 2.47,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 67,
      "total_bill": 3.07,
      "tip": 1,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 1
  },
  {
      "index": 68,
      "total_bill": 20.23,
      "tip": 2.01,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 69,
      "total_bill": 15.01,
      "tip": 2.09,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 70,
      "total_bill": 12.02,
      "tip": 1.97,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 71,
      "total_bill": 17.07,
      "tip": 3,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 72,
      "total_bill": 26.86,
      "tip": 3.14,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 73,
      "total_bill": 25.28,
      "tip": 5,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 74,
      "total_bill": 14.73,
      "tip": 2.2,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 75,
      "total_bill": 10.51,
      "tip": 1.25,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 76,
      "total_bill": 17.92,
      "tip": 3.08,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 77,
      "total_bill": 27.2,
      "tip": 4,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 4
  },
  {
      "index": 78,
      "total_bill": 22.76,
      "tip": 3,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 79,
      "total_bill": 17.29,
      "tip": 2.71,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 80,
      "total_bill": 19.44,
      "tip": 3,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 81,
      "total_bill": 16.66,
      "tip": 3.4,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 82,
      "total_bill": 10.07,
      "tip": 1.83,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 1
  },
  {
      "index": 83,
      "total_bill": 32.68,
      "tip": 5,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 84,
      "total_bill": 15.98,
      "tip": 2.03,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 85,
      "total_bill": 34.83,
      "tip": 5.17,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 4
  },
  {
      "index": 86,
      "total_bill": 13.03,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 87,
      "total_bill": 18.28,
      "tip": 4,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 88,
      "total_bill": 24.71,
      "tip": 5.85,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 89,
      "total_bill": 21.16,
      "tip": 3,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 90,
      "total_bill": 28.97,
      "tip": 3,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 91,
      "total_bill": 22.49,
      "tip": 3.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 92,
      "total_bill": 5.75,
      "tip": 1,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 93,
      "total_bill": 16.32,
      "tip": 4.3,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 94,
      "total_bill": 22.75,
      "tip": 3.25,
      "sex": "Female",
      "smoker": "No",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 95,
      "total_bill": 40.17,
      "tip": 4.73,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 96,
      "total_bill": 27.28,
      "tip": 4,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 97,
      "total_bill": 12.03,
      "tip": 1.5,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 98,
      "total_bill": 21.01,
      "tip": 3,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 99,
      "total_bill": 12.46,
      "tip": 1.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 100,
      "total_bill": 11.35,
      "tip": 2.5,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 101,
      "total_bill": 15.38,
      "tip": 3,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 102,
      "total_bill": 44.3,
      "tip": 2.5,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 103,
      "total_bill": 22.42,
      "tip": 3.48,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 104,
      "total_bill": 20.92,
      "tip": 4.08,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 105,
      "total_bill": 15.36,
      "tip": 1.64,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 106,
      "total_bill": 20.49,
      "tip": 4.06,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 107,
      "total_bill": 25.21,
      "tip": 4.29,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 108,
      "total_bill": 18.24,
      "tip": 3.76,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 109,
      "total_bill": 14.31,
      "tip": 4,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 110,
      "total_bill": 14,
      "tip": 3,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 111,
      "total_bill": 7.25,
      "tip": 1,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 1
  },
  {
      "index": 112,
      "total_bill": 38.07,
      "tip": 4,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 113,
      "total_bill": 23.95,
      "tip": 2.55,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 114,
      "total_bill": 25.71,
      "tip": 4,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 115,
      "total_bill": 17.31,
      "tip": 3.5,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 116,
      "total_bill": 29.93,
      "tip": 5.07,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 117,
      "total_bill": 10.65,
      "tip": 1.5,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 118,
      "total_bill": 12.43,
      "tip": 1.8,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 119,
      "total_bill": 24.08,
      "tip": 2.92,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 4
  },
  {
      "index": 120,
      "total_bill": 11.69,
      "tip": 2.31,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 121,
      "total_bill": 13.42,
      "tip": 1.68,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 122,
      "total_bill": 14.26,
      "tip": 2.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 123,
      "total_bill": 15.95,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 124,
      "total_bill": 12.48,
      "tip": 2.52,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 125,
      "total_bill": 29.8,
      "tip": 4.2,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 6
  },
  {
      "index": 126,
      "total_bill": 8.52,
      "tip": 1.48,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 127,
      "total_bill": 14.52,
      "tip": 2,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 128,
      "total_bill": 11.38,
      "tip": 2,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 129,
      "total_bill": 22.82,
      "tip": 2.18,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 3
  },
  {
      "index": 130,
      "total_bill": 19.08,
      "tip": 1.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 131,
      "total_bill": 20.27,
      "tip": 2.83,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 132,
      "total_bill": 11.17,
      "tip": 1.5,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 133,
      "total_bill": 12.26,
      "tip": 2,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 134,
      "total_bill": 18.26,
      "tip": 3.25,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 135,
      "total_bill": 8.51,
      "tip": 1.25,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 136,
      "total_bill": 10.33,
      "tip": 2,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 137,
      "total_bill": 14.15,
      "tip": 2,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 138,
      "total_bill": 16,
      "tip": 2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 139,
      "total_bill": 13.16,
      "tip": 2.75,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 140,
      "total_bill": 17.47,
      "tip": 3.5,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 141,
      "total_bill": 34.3,
      "tip": 6.7,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 6
  },
  {
      "index": 142,
      "total_bill": 41.19,
      "tip": 5,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 5
  },
  {
      "index": 143,
      "total_bill": 27.05,
      "tip": 5,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 6
  },
  {
      "index": 144,
      "total_bill": 16.43,
      "tip": 2.3,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 145,
      "total_bill": 8.35,
      "tip": 1.5,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 146,
      "total_bill": 18.64,
      "tip": 1.36,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 3
  },
  {
      "index": 147,
      "total_bill": 11.87,
      "tip": 1.63,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 148,
      "total_bill": 9.78,
      "tip": 1.73,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 149,
      "total_bill": 7.51,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 150,
      "total_bill": 14.07,
      "tip": 2.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 151,
      "total_bill": 13.13,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 152,
      "total_bill": 17.26,
      "tip": 2.74,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 153,
      "total_bill": 24.55,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 154,
      "total_bill": 19.77,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 155,
      "total_bill": 29.85,
      "tip": 5.14,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 5
  },
  {
      "index": 156,
      "total_bill": 48.17,
      "tip": 5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 6
  },
  {
      "index": 157,
      "total_bill": 25,
      "tip": 3.75,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 158,
      "total_bill": 13.39,
      "tip": 2.61,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 159,
      "total_bill": 16.49,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 160,
      "total_bill": 21.5,
      "tip": 3.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 161,
      "total_bill": 12.66,
      "tip": 2.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 162,
      "total_bill": 16.21,
      "tip": 2,
      "sex": "Female",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 163,
      "total_bill": 13.81,
      "tip": 2,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 164,
      "total_bill": 17.51,
      "tip": 3,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 165,
      "total_bill": 24.52,
      "tip": 3.48,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 166,
      "total_bill": 20.76,
      "tip": 2.24,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 167,
      "total_bill": 31.71,
      "tip": 4.5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 168,
      "total_bill": 10.59,
      "tip": 1.61,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 169,
      "total_bill": 10.63,
      "tip": 2,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 170,
      "total_bill": 50.81,
      "tip": 10,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 171,
      "total_bill": 15.81,
      "tip": 3.16,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 172,
      "total_bill": 7.25,
      "tip": 5.15,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 173,
      "total_bill": 31.85,
      "tip": 3.18,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 174,
      "total_bill": 16.82,
      "tip": 4,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 175,
      "total_bill": 32.9,
      "tip": 3.11,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 176,
      "total_bill": 17.89,
      "tip": 2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 177,
      "total_bill": 14.48,
      "tip": 2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 178,
      "total_bill": 9.6,
      "tip": 4,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 179,
      "total_bill": 34.63,
      "tip": 3.55,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 180,
      "total_bill": 34.65,
      "tip": 3.68,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 181,
      "total_bill": 23.33,
      "tip": 5.65,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 182,
      "total_bill": 45.35,
      "tip": 3.5,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 183,
      "total_bill": 23.17,
      "tip": 6.5,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 184,
      "total_bill": 40.55,
      "tip": 3,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 185,
      "total_bill": 20.69,
      "tip": 5,
      "sex": "Male",
      "smoker": "No",
      "day": "Sun",
      "time": "Dinner",
      "size": 5
  },
  {
      "index": 186,
      "total_bill": 20.9,
      "tip": 3.5,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 187,
      "total_bill": 30.46,
      "tip": 2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 5
  },
  {
      "index": 188,
      "total_bill": 18.15,
      "tip": 3.5,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 189,
      "total_bill": 23.1,
      "tip": 4,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 190,
      "total_bill": 15.69,
      "tip": 1.5,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sun",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 191,
      "total_bill": 19.81,
      "tip": 4.19,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 192,
      "total_bill": 28.44,
      "tip": 2.56,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 193,
      "total_bill": 15.48,
      "tip": 2.02,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 194,
      "total_bill": 16.58,
      "tip": 4,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 195,
      "total_bill": 7.56,
      "tip": 1.44,
      "sex": "Male",
      "smoker": "No",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 196,
      "total_bill": 10.34,
      "tip": 2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 197,
      "total_bill": 43.11,
      "tip": 5,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 4
  },
  {
      "index": 198,
      "total_bill": 13,
      "tip": 2,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 199,
      "total_bill": 13.51,
      "tip": 2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 200,
      "total_bill": 18.71,
      "tip": 4,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 3
  },
  {
      "index": 201,
      "total_bill": 12.74,
      "tip": 2.01,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 202,
      "total_bill": 13,
      "tip": 2,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 203,
      "total_bill": 16.4,
      "tip": 2.5,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 204,
      "total_bill": 20.53,
      "tip": 4,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 4
  },
  {
      "index": 205,
      "total_bill": 16.47,
      "tip": 3.23,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Thur",
      "time": "Lunch",
      "size": 3
  },
  {
      "index": 206,
      "total_bill": 26.59,
      "tip": 3.41,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 207,
      "total_bill": 38.73,
      "tip": 3,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 208,
      "total_bill": 24.27,
      "tip": 2.03,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 209,
      "total_bill": 12.76,
      "tip": 2.23,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 210,
      "total_bill": 30.06,
      "tip": 2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 211,
      "total_bill": 25.89,
      "tip": 5.16,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 212,
      "total_bill": 48.33,
      "tip": 9,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 213,
      "total_bill": 13.27,
      "tip": 2.5,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 214,
      "total_bill": 28.17,
      "tip": 6.5,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 215,
      "total_bill": 12.9,
      "tip": 1.1,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 216,
      "total_bill": 28.15,
      "tip": 3,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 5
  },
  {
      "index": 217,
      "total_bill": 11.59,
      "tip": 1.5,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 218,
      "total_bill": 7.74,
      "tip": 1.44,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 219,
      "total_bill": 30.14,
      "tip": 3.09,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 220,
      "total_bill": 12.16,
      "tip": 2.2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 221,
      "total_bill": 13.42,
      "tip": 3.48,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 222,
      "total_bill": 8.58,
      "tip": 1.92,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Lunch",
      "size": 1
  },
  {
      "index": 223,
      "total_bill": 15.98,
      "tip": 3,
      "sex": "Female",
      "smoker": "No",
      "day": "Fri",
      "time": "Lunch",
      "size": 3
  },
  {
      "index": 224,
      "total_bill": 13.42,
      "tip": 1.58,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 225,
      "total_bill": 16.27,
      "tip": 2.5,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 226,
      "total_bill": 10.09,
      "tip": 2,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Fri",
      "time": "Lunch",
      "size": 2
  },
  {
      "index": 227,
      "total_bill": 20.45,
      "tip": 3,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 228,
      "total_bill": 13.28,
      "tip": 2.72,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 229,
      "total_bill": 22.12,
      "tip": 2.88,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 230,
      "total_bill": 24.01,
      "tip": 2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 4
  },
  {
      "index": 231,
      "total_bill": 15.69,
      "tip": 3,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 232,
      "total_bill": 11.61,
      "tip": 3.39,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 233,
      "total_bill": 10.77,
      "tip": 1.47,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 234,
      "total_bill": 15.53,
      "tip": 3,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 235,
      "total_bill": 10.07,
      "tip": 1.25,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 236,
      "total_bill": 12.6,
      "tip": 1,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 237,
      "total_bill": 32.83,
      "tip": 1.17,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 238,
      "total_bill": 35.83,
      "tip": 4.67,
      "sex": "Female",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 239,
      "total_bill": 29.03,
      "tip": 5.92,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 3
  },
  {
      "index": 240,
      "total_bill": 27.18,
      "tip": 2,
      "sex": "Female",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 241,
      "total_bill": 22.67,
      "tip": 2,
      "sex": "Male",
      "smoker": "Yes",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 242,
      "total_bill": 17.82,
      "tip": 1.75,
      "sex": "Male",
      "smoker": "No",
      "day": "Sat",
      "time": "Dinner",
      "size": 2
  },
  {
      "index": 243,
      "total_bill": 18.78,
      "tip": 3,
      "sex": "Female",
      "smoker": "No",
      "day": "Thur",
      "time": "Dinner",
      "size": 2
  }
]};


const options = {
  title: 'Violin Plot for Restaurant Costs',
  plotOrientation: "Vertical",
  numDataAxis: "total_bill",
  category: "noneAtAll",
  groupCol: "noneAtAll",
};

const options2 = {
  title: 'Violin Plot for Restaurant Costs',
  colorMap: "Category10",
  plotOrientation: "Vertical",
  // splitEnabled: false,
  // numOfCats: 4,
  numDataAxis: "total_bill",
  category: "day",
  groupCol: "noneAtAll",
  // manualColors: "yellow blue",
};

const options3 = {
  title: 'Violin Plot for Restaurant Costs',
  colorMap: "Category10",
  plotOrientation: "Vertical",
  // splitEnabled: false,
  // numOfCats: 4,
  numDataAxis: "total_bill",
  category: "day",
  groupCol: "sex",
  // manualColors: "yellow blue",
};

const options4 = {
  title: 'Violin Plot for Restaurant Costs',
  colorMap: "Category10",
  plotOrientation: "Vertical",
  splitEnabled: true,
  // numOfCats: 4,
  numDataAxis: "total_bill",
  category: "day",
  groupCol: "smoker",
  // manualColors: "yellow blue",
};
//=========================================

//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('Violin Plot', module);
stories
  .add('...empty', () => <ViolinPlotVis />)
  .add('...Single Basic Violin', () => (
    <ViolinPlotVis
      data = { data }
      options = { options }
    />
  ))
  .add('...Multiple Violins', () => (
    <ViolinPlotVis
      data = { data }
      options = { options2 }
    />
  ))
  .add('...Grouped Multiple Violins', () => (
    <ViolinPlotVis
      data = { data }
      options = { options3 }
    />
  ))
  .add('...Split Grouped Multiple Violins', () => (
    <ViolinPlotVis
      data = { data }
      options = { options4 }
    />
  ));
//-------------------------------------------------------------------------------------------------
