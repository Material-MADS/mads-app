/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: These are the available reducers for the 'Views' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Views' let us look at the data in various ways via multiple visualization components
// ------------------------------------------------------------------------------------------------
// References: View Actions and Operations
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { ADD_VIEW, REMOVE_VIEW, UPDATE_VIEW } from '../actions';
import operations from '../operations/views';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer method for this module/feature
//-------------------------------------------------------------------------------------------------
function views(state = [], action) {
  switch (action.type) {
    case ADD_VIEW:
      if(!isNaN(action.index)){
        const newViewsList = [...state];
        newViewsList.splice(action.index, 0, action.view);
        return newViewsList;
      }
      else{
        return [...state, action.view];
      }
    case REMOVE_VIEW:
      return state.filter((view) => view.id !== action.id);
    case UPDATE_VIEW:
      return operations.getUpdatedViewsState(state, action.id, action.settings);
    default:
      return state;
  }
}
//-------------------------------------------------------------------------------------------------

export default views;
