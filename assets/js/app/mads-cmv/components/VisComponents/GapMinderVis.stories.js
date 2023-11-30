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
const theData = gmData;
const theOptions = { };
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
