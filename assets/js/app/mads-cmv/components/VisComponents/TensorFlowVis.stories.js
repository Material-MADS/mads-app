/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'TensorFlow' module
// ------------------------------------------------------------------------------------------------
// Notes: 'TensorFlow' is a visualization component that displays TensorFlow ML results based on a
//        range of available properties.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, image test data, ImageView VizComp
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import TensorFlow from './TensorFlowVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('TensorFlow', module);
stories
  .add('...Empty', () => <TensorFlow />)
  .add('...WebCam Object Detection', () => (
    <TensorFlow
      options = { {
        tfMode: 'WebCam Object Detection',
        modeArgs: {arg1: 2},
      } }
    />
  ))
  .add('...Image Classification', () => (
    <TensorFlow
      options = { {
        tfMode: 'Image Classification',
        modeArgs: {arg1: "Dog Breeds"},
      } }
    />
  ));
  // .add('...with medium local file image', () => (
  //   <ImageView
  //     data = { localFileData }
  //     options = { localFileOptions }
  //   />
  // ))
  // .add('...with large online file image', () => (
  //   <ImageView
  //     data = { IVDPack.data }
  //     options = { IVDPack.options }
  //   />
  // ));
  //-------------------------------------------------------------------------------------------------
