/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: These are the available operations for the 'Views' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Views' let us look at the data in various ways via multiple visualization components
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Available model Operations
//-------------------------------------------------------------------------------------------------
const getUpdatedViewsState = (state, id, settings) => {
  const newState = [...state];

  const target = newState.find((v) => v.id === id);
  if (target) {
    target.settings = settings;
  }

  return newState;
};
//-------------------------------------------------------------------------------------------------

export default { getUpdatedViewsState };
