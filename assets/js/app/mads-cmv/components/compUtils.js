/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is a set of Utility Support Functions for the Components
// ------------------------------------------------------------------------------------------------
// Notes: 'compUtils' is a set of utility support methods provided for the Components when needed.
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/


//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// Create New Id
// Returns a new id to be used when creating a new view making sure it will not be used already
//-------------------------------------------------------------------------------------------------
export function createNewId(existingViews, startId) {
  const ids = existingViews.map((v) => v.id);
  let currentId = startId || 1;

  let id = currentId.toString();
  while (ids.includes(id)) {
    currentId += 1;
    id = currentId.toString();
  }

  return id;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Component Support Methods
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
