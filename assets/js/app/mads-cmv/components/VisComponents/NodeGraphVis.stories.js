/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'NodeGraph' module
// ------------------------------------------------------------------------------------------------
// Notes: 'NodeGraph' is a network visualization component that displays an interactive node - link
//        graph.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, 3rd party lodash lib, NodeGraph VizComp
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import NodeGraph from './NodeGraphVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('NodeGraph', module);
stories
  .add('...Super Simple Basic', () => (
    <NodeGraph />
  ));
//-------------------------------------------------------------------------------------------------
