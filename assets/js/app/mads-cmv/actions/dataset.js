/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available Actions for the 'Dataset' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Dataset' let us set up ways to look at the data
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Export constants and methods
//-------------------------------------------------------------------------------------------------
export const DATASET_MAIN_UPDATE = 'DATASET_MAIN_UPDATE';
export const DATASET_ADD_VIEW = 'DATASET_ADD_VIEW';
export const DATASET_REMOVE_VIEW = 'DATASET_REMOVE_VIEW';

export const DATASET_VIEW_CONTENT_REQUEST = 'DATASET_VIEW_CONTENT_REQUEST';
export const DATASET_VIEW_CONTENT_SUCCESS = 'DATASET_VIEW_CONTENT_SUCCESS';
export const DATASET_VIEW_CONTENT_FAILURE = 'DATASET_VIEW_CONTENT_FAILURE';

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const updateMainDataset = (data) => ({
  type: DATASET_MAIN_UPDATE,
  data,
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const addDatasetView = (id, data) => ({
  type: DATASET_ADD_VIEW,
  id,
  data,
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const removeDatasetView = (id) => ({
  type: DATASET_REMOVE_VIEW,
  id,
});
//-------------------------------------------------------------------------------------------------
