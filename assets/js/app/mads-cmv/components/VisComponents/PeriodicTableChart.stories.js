/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'PeriodicTable' module
// ------------------------------------------------------------------------------------------------
// Notes: 'PeriodicTable' is a visualization component that displays a classic Periodic Table
//        with the most common elements abd most of their attributes, rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, PeriodicTable VizComp
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import PeriodicTable from './PeriodicTableChart';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the story configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('PeriodicTable', module);
stories
  .add('...standard', () => <PeriodicTable />);
//-------------------------------------------------------------------------------------------------
