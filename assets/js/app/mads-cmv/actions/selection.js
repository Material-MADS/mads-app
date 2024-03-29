/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available Actions for the 'Selection' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Selection' let us select some specific data in a component and have that be selected
//        across all others.
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Export constants and methods
//-------------------------------------------------------------------------------------------------
export const UPDATE_SELECTION = 'UPDATE_SELECTION';

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const updateSelection = (items) => ({
  type: UPDATE_SELECTION,
  items,
});
//-------------------------------------------------------------------------------------------------
