/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: Reducer for the Advisor feature/module
// ------------------------------------------------------------------------------------------------
// Notes: Maintains Advisor enablement, message list, and minimized state.
// ------------------------------------------------------------------------------------------------
// References: Advisor actions
=================================================================================================*/

import {
  SET_ADVISOR_ENABLED,
  ADD_ADVISOR_MESSAGE,
  CLEAR_ADVISOR_MESSAGES,
  SET_ADVISOR_MINIMIZED,
} from '../actions/advisor';

const initialState = {
  enabled: false,
  messages: [],
  isMinimized: false,
};

function advisor(state = initialState, action) {
  switch (action.type) {
    case SET_ADVISOR_ENABLED:
      return {
        ...state,
        enabled: action.enabled,
      };

    case ADD_ADVISOR_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: action.message.id || `${Date.now()}-${state.messages.length}`,
            title: action.message.title || 'Advisor',
            body: action.message.body || '',
            imageUrl: action.message.imageUrl || null,
            link: action.message.link || null,
            actions: action.message.actions || [],
            type: action.message.type || 'info',
            createdAt: action.message.createdAt || new Date().toISOString(),
          },
        ],
      };

    case CLEAR_ADVISOR_MESSAGES:
      return {
        ...state,
        messages: [],
      };

    case SET_ADVISOR_MINIMIZED:
      return {
        ...state,
        isMinimized: action.isMinimized,
      };

    default:
      return state;
  }
}

export default advisor;
