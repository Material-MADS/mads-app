/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'Cads_Component_Template' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Cads_Component_Template' is a visualization component that do nothing really.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, image test data, component Vis
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import Cads_Component_Template from './Cads_Component_TemplateVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('Cads_Component_Template', module);
stories
  .add('...Empty', () => <Cads_Component_Template />)
  .add('...With Something', () => (
    <Cads_Component_Template
      data = { {} }
      options = { {
        something: "Something",
        anotherThing: 7
      } }
    />
  ));
  //-------------------------------------------------------------------------------------------------
