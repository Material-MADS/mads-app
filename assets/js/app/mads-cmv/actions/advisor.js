/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available actions for the 'Advisor' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Advisor' provides a reusable floating help interface for CADS subsystems.
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Export constants and methods
//-------------------------------------------------------------------------------------------------
export const SET_ADVISOR_ENABLED = 'SET_ADVISOR_ENABLED';
export const ADD_ADVISOR_MESSAGE = 'ADD_ADVISOR_MESSAGE';
export const CLEAR_ADVISOR_MESSAGES = 'CLEAR_ADVISOR_MESSAGES';
export const SET_ADVISOR_MINIMIZED = 'SET_ADVISOR_MINIMIZED';

//-------------------------------------------------------------------------------------------------
export const setAdvisorEnabled = (enabled) => ({
  type: SET_ADVISOR_ENABLED,
  enabled,
});

//-------------------------------------------------------------------------------------------------
export const addAdvisorMessage = (message) => ({
  type: ADD_ADVISOR_MESSAGE,
  message,
});

//-------------------------------------------------------------------------------------------------
export const clearAdvisorMessages = () => ({
  type: CLEAR_ADVISOR_MESSAGES,
});

//-------------------------------------------------------------------------------------------------
export const setAdvisorMinimized = (isMinimized) => ({
  type: SET_ADVISOR_MINIMIZED,
  isMinimized,
});
