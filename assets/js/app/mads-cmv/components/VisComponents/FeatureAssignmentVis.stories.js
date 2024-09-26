/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'FeatureAssignment' module
// ------------------------------------------------------------------------------------------------
// Notes: 'FeatureAssignment' is a visualization component that do nothing really.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, image test data, component Vis
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import FeatureAssignment from './FeatureAssignmentVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('FeatureAssignment', module);
stories
  .add('...Empty', () => <FeatureAssignment />)
  .add('...With Something', () => (
    <FeatureAssignment
      data = { {} }
      options = { {
        something: "Something",
        anotherThing: 7
      } }
    />
  ));
  //-------------------------------------------------------------------------------------------------
