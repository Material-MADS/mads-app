/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'CatalystPropertyConversion' module
// ------------------------------------------------------------------------------------------------
// Notes: 'CatalystPropertyConversion' is a visualization component that do nothing really.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, image test data, component Vis
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import CatalystPropertyConversion from './CatalystPropertyConversionVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('CatalystPropertyConversion', module);
stories
  .add('...Empty', () => <CatalystPropertyConversion />)
  .add('...With Something', () => (
    <CatalystPropertyConversion
      data = { {} }
      options = { {
        something: "Something",
        anotherThing: 7
      } }
    />
  ));
  //-------------------------------------------------------------------------------------------------
