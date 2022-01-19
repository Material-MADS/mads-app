/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: These are the available operations for the 'Color Tag' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Color Tags' let us assign specific colors to our data as displayed in the components
// ------------------------------------------------------------------------------------------------
// References: ColorTag model
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import ColorTag from '../models/ColorTag';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available model Operations
//-------------------------------------------------------------------------------------------------
const getUpdatedColorTagState = (state, id, properties) => {
  const newState = [...state];

  const index = newState.findIndex((c) => c.id === id);
  const oldTag = newState[index];
  const newTag = new ColorTag({
    id,
    color: oldTag,
    itemIndices: oldTag.itemIndices,
  });

  if (properties.color) {
    newTag.color = properties.color;
  }
  if (properties.itemIndices) {
    newTag.itemIndices = properties.itemIndices;
  }

  newState[index] = newTag;

  return newState;
};
//-------------------------------------------------------------------------------------------------

export default { getUpdatedColorTagState };
