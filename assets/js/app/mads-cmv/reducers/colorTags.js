/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available reducers for the 'Color Tag' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Color Tags' let us assign specific colors to our data as displayed in the components
// ------------------------------------------------------------------------------------------------
// References: ColorTag actions and operations
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { ADD_COLORTAG, REMOVE_COLORTAG, UPDATE_COLORTAG } from '../actions';
import operations from '../operations/colorTags';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer method for this module/feature
//-------------------------------------------------------------------------------------------------
function colorTags(state = [], action) {
  switch (action.type) {
    case ADD_COLORTAG:
      return [...state, action.colorTag];
    case REMOVE_COLORTAG:
      return state.filter((c) => c.id !== action.id);
    case UPDATE_COLORTAG:
      return operations.getUpdatedColorTagState(
        state,
        action.id,
        action.properties
      );
    default:
      return state;
  }
}
//-------------------------------------------------------------------------------------------------

export default colorTags;
