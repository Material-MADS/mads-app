/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'ParCoords' module
// ------------------------------------------------------------------------------------------------
// Notes: 'ParCoords' is a visualization component that displays a Parallell Coordinate chart in
//        various ways based on a range of available properties, and is rendered with the help of
//        the ParCoords library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, ParCoordsPlot VizComp and ColorTag
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ParCoordsPlot from './ParCoords';
import ColorTag from '../../models/ColorTag';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------

// 'with simple data', 'with extent', 'with axes' and 'with selection'
//====================================================================
const foods = [
  { name: 'Asparagus', protein: 2.2, calcium: 0.024, sodium: 0.002 },
  { name: 'Butter', protein: 0.85, calcium: 0.024, sodium: 0.714 },
  { name: 'Coffeecake', protein: 6.8, calcium: 0.054, sodium: 0.351 },
  { name: 'Pork', protein: 28.5, calcium: 0.016, sodium: 0.056 },
  { name: 'Provolone', protein: 25.58, calcium: 0.756, sodium: 0.876 },
];
//====================================================================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('ParCoord', module);
stories
  .add('empty bar chart', () => <ParCoordsPlot />)
  .add('with simple data', () => (
    <ParCoordsPlot
      data={foods}
    />
  ))
  .add('with extent', () => (
    <ParCoordsPlot
      data={foods}
      options={{ extent: { width: 1000, height: 400 } }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with axes', () => (
    <ParCoordsPlot data={foods} axes={['name', 'protein']} />
  ))
  .add('with ColorTags', () => {
    const cTag = new ColorTag({
      color: 'red',
      itemIndices: [0, 1, 2],
    });
    return <ParCoordsPlot data={foods} colorTags={[cTag]} />;
  })
  .add('with selection', () => (
    <ParCoordsPlot
      data={foods}
      selectedIndices={[0, 1, 2]}
      onSelectedIndicesChange={action('selected_change')}
    />
  ));
//-------------------------------------------------------------------------------------------------
