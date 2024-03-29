/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available reducers for the 'Message' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Message' let us communicate a message to the user
// ------------------------------------------------------------------------------------------------
// References: Message actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { SET_MESSAGE, SET_MESSAGE_OPEN } from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer initialState for this module/feature
//-------------------------------------------------------------------------------------------------
const initialState = {
  messageOpen: false,
  header: '',
  content: '',
  type: '',
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer method for this module/feature
//-------------------------------------------------------------------------------------------------
function message(state = initialState, action) {
  switch (action.type) {
    case SET_MESSAGE:
      return {
        ...state,
        ...action.message,
      };

    case SET_MESSAGE_OPEN:
      return {
        ...state,
        messageOpen: action.state,
      };

    default:
      return state;
  }
}
//-------------------------------------------------------------------------------------------------

export default message;
