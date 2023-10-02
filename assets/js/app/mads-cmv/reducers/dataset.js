/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available reducers for the 'Dataset' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Dataset' let us set up ways to look at the data
// ------------------------------------------------------------------------------------------------
// References: Dataset actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DATASET_MAIN_UPDATE, DATASET_ADD_VIEW, DATASET_REMOVE_VIEW, } from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer initialState for this module/feature
//-------------------------------------------------------------------------------------------------
const initialState = { main: {}, };
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer method for this module/feature
//-------------------------------------------------------------------------------------------------
const dataset = (state = initialState, action) => {
  switch (action.type) {
    case DATASET_MAIN_UPDATE:
      return {
        ...state,
        main: action.data,
      };
    case DATASET_ADD_VIEW:
      return {
        ...state,
        [action.id]: action.data,
      };
    case DATASET_REMOVE_VIEW:
      return {
        ...state,
        [action.id]: undefined,
      };
    default:
      return state;
  }
};
//-------------------------------------------------------------------------------------------------

export default dataset;
