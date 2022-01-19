/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: These are the available reducers for the 'Selection' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Selection' let us select some specific data in a component and have that be selected
//        across all others.
// ------------------------------------------------------------------------------------------------
// References: Selection actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { UPDATE_SELECTION } from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer method for this module/feature
//-------------------------------------------------------------------------------------------------
function selection(state = [], action) {
  switch (action.type) {
    case UPDATE_SELECTION:
      return [...action.items];

    default:
      return state;
  }
}
//-------------------------------------------------------------------------------------------------

export default selection;
