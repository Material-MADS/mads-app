/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available Actions for the 'Data source' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Data source' let us load various data
// ------------------------------------------------------------------------------------------------
// References: api and dataset
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import api from '../api';
import { updateMainDataset } from './dataset';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Export constants and methods
//-------------------------------------------------------------------------------------------------
export const DATASOURCES_REQUEST = 'DATASOURCES_REQUEST';
export const DATASOURCES_SUCCESS = 'DATASOURCES_SUCCESS';
export const DATASOURCES_FAILURE = 'DATASOURCES_FAILURE';

// SelectedDataSource
export const DATASOURCES_CONTENT_REQUEST = 'DATASOURCES_CONTENT_REQUEST';
export const DATASOURCES_CONTENT_SUCCESS = 'DATASOURCES_CONTENT_SUCCESS';
export const DATASOURCES_CONTENT_FAILURE = 'DATASOURCES_CONTENT_FAILURE';
export const SELECT_DATASOUCE = 'SELECT_DATASOUCE';

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
const requestDataSources = () => ({
  type: DATASOURCES_REQUEST,
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
const receiveDataSources = (json) => ({
  type: DATASOURCES_SUCCESS,
  dataSources: json,
  receivedAt: Date.now(),
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
const getDataSourcesFailure = (error) => ({
  type: DATASOURCES_FAILURE,
  error,
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
const fetchDataSources = () => (dispatch) => {
  dispatch(requestDataSources());
  return api.datasources
    .fetchDataSourceList()
    .then((res) => dispatch(receiveDataSources(res.data)))
    .catch((err) => dispatch(getDataSourcesFailure(err)));
};
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const fetchDataSourcesIfNeeded = () => (dispatch, getState) => {
  return dispatch(fetchDataSources());
};
//-------------------------------------------------------------------------------------------------


// SelectedDataSource
//-------------------------------------------------------------------------------------------------
const requestDataSourceContent = () => ({
  type: DATASOURCES_CONTENT_REQUEST,
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
const receiveDataSourceContent = (json) => ({
  type: DATASOURCES_CONTENT_SUCCESS,
  content: json,
  receivedAt: Date.now(),
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
const getDataSourceContentFailure = (error) => ({
  type: DATASOURCES_CONTENT_FAILURE,
  error,
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const selectDataSource = (id) => ({
  type: SELECT_DATASOUCE,
  id,
});
//-------------------------------------------------------------------------------------------------

// Combined action creators
//-------------------------------------------------------------------------------------------------
export const fetchDataSourceContent = (id) => (dispatch) => {
  dispatch(requestDataSourceContent());
  return api.datasources
    .fetchDataSourceContent(id)
    .then((res) => res.json())
    .then((json) => {
      dispatch(receiveDataSourceContent(json));
      dispatch(updateMainDataset(json));
    })
    .catch((err) => dispatch(getDataSourceContentFailure(err)));
};
//-------------------------------------------------------------------------------------------------
