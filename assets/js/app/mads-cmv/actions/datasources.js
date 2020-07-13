import api from '../api';

import { updateMainDataset } from './dataset';

// DataSources
export const DATASOURCES_REQUEST = 'DATASOURCES_REQUEST';
export const DATASOURCES_SUCCESS = 'DATASOURCES_SUCCESS';
export const DATASOURCES_FAILURE = 'DATASOURCES_FAILURE';

const requestDataSources = () => ({
  type: DATASOURCES_REQUEST,
});

const receiveDataSources = (json) => ({
  type: DATASOURCES_SUCCESS,
  dataSources: json,
  receivedAt: Date.now(),
});

const getDataSourcesFailure = (error) => ({
  type: DATASOURCES_FAILURE,
  error,
});

const fetchDataSources = () => (dispatch) => {
  dispatch(requestDataSources());
  return api.datasources
    .fetchDataSourceList()
    .then((res) => dispatch(receiveDataSources(res.data)))
    .catch((err) => dispatch(getDataSourcesFailure(err)));
};

export const fetchDataSourcesIfNeeded = () => (dispatch, getState) => {
  // console.log(getState());
  return dispatch(fetchDataSources());
};

// SelectedDataSource
export const DATASOURCES_CONTENT_REQUEST = 'DATASOURCES_CONTENT_REQUEST';
export const DATASOURCES_CONTENT_SUCCESS = 'DATASOURCES_CONTENT_SUCCESS';
export const DATASOURCES_CONTENT_FAILURE = 'DATASOURCES_CONTENT_FAILURE';
export const SELECT_DATASOUCE = 'SELECT_DATASOUCE';

const requestDataSourceContent = () => ({
  type: DATASOURCES_CONTENT_REQUEST,
});

const receiveDataSourceContent = (json) => ({
  type: DATASOURCES_CONTENT_SUCCESS,
  content: json,
  receivedAt: Date.now(),
});

const getDataSourceContentFailure = (error) => ({
  type: DATASOURCES_CONTENT_FAILURE,
  error,
});

export const selectDataSource = (id) => ({
  type: SELECT_DATASOUCE,
  id,
});

// Combined action creators
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
