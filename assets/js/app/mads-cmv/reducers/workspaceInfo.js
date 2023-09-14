/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available reducers for the 'Workspace Info' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Workspace Info' let us get information about the current workspace (a set of views
//        (visualization components) as a group (workspace))
// ------------------------------------------------------------------------------------------------
// References: Workspace actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { WORKSPACE_INFO_REQUEST, WORKSPACE_INFO_SUCCESS, WORKSPACE_INFO_FAILURE, } from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer method for this module/feature
//-------------------------------------------------------------------------------------------------
function userInfo(state = {}, action) {
  switch (action.type) {
    case WORKSPACE_INFO_REQUEST:
      return {
        isStored: false,
      };

    case WORKSPACE_INFO_SUCCESS:
      if (Object.keys(action.data).length > 0) {
        return {
          ...action.data,
          isStored: true,
        };
      }

      return {
        isStored: false,
      };

    case WORKSPACE_INFO_FAILURE:
      return {
        isStored: false,
      };
    default:
      return state;
  }
}
//-------------------------------------------------------------------------------------------------

export default userInfo;
