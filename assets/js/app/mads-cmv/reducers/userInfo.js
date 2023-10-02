/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available reducers for the 'User Info' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'User Info' let us get information on the current user
// ------------------------------------------------------------------------------------------------
// References: UserInfo actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { USER_INFO_REQUEST, USER_INFO_SUCCESS, USER_INFO_FAILURE, } from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer method for this module/feature
//-------------------------------------------------------------------------------------------------
function userInfo(state = {}, action) {
  switch (action.type) {
    case USER_INFO_REQUEST:
      return {
        user: null,
        isLoggedIn: false,
      };
    case USER_INFO_SUCCESS:
      if (Object.keys(action.data).length > 0) {
        return {
          user: action.data,
          isLoggedIn: true,
        };
      }

      return {
        isLoggedIn: false,
      };

    case USER_INFO_FAILURE:
      return {
        user: null,
        isLoggedIn: false,
      };
    default:
      return state;
  }
}
//-------------------------------------------------------------------------------------------------

export default userInfo;
