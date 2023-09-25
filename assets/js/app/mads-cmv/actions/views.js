/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available Actions for the 'Views' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Views' let us look at the data in various ways via multiple visualization components
// ------------------------------------------------------------------------------------------------
// References: api, dataset and message
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import api from '../api';
import * as datasetActions from './dataset';
import * as messageActions from './message';
import * as loadingActions from './loading';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Export constants and methods
//-------------------------------------------------------------------------------------------------
export const ADD_VIEW = 'ADD_VIEW';
export const REMOVE_VIEW = 'REMOVE_VIEW';
export const UPDATE_VIEW = 'UPDATE_VIEW';

export const VIEW_UPDATE_REMOTE_REQUEST = 'VIEW_UPDATE_REMOTE_REQUEST';
export const VIEW_UPDATE_REMOTE_SUCCESS = 'VIEW_UPDATE_REMOTE_SUCCESS';
export const VIEW_UPDATE_REMOTE_FAILURE = 'VIEW_UPDATE_REMOTE_FAILURE';

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const addView = (view, index) => ({
  type: ADD_VIEW,
  view,
  index,
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const removeView = (id) => ({
  type: REMOVE_VIEW,
  id,
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const updateView = (id, settings) => {
  return {
    type: UPDATE_VIEW,
    id,
    settings,
  };
};
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const requestViewUpdateRemote = (id, view) => {
  return {
    type: VIEW_UPDATE_REMOTE_REQUEST,
    id,
    view,
  };
};
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const receiveViewUpdateRemote = (data) => {
  return {
    type: VIEW_UPDATE_REMOTE_SUCCESS,
    content: data,
    receiveAt: Date.now(),
  };
};
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const requestViewUpdateRemoteFailure = (error) => ({
  type: VIEW_UPDATE_REMOTE_FAILURE,
  error,
});
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const sendRequestViewUpdate = (view, values, data) => (dispatch) => {
  dispatch(requestViewUpdateRemote());
  view.settings = values;
  dispatch(updateView(values));
  dispatch(loadingActions.setLoadingState(true));

  return api.views
    .sendRequestViewUpdate(view, data)
    .then((res) => {
      dispatch(receiveViewUpdateRemote(res.data));
      dispatch(datasetActions.addDatasetView(view.id, res.data));
      // dispatch(loadingActions.setLoadingState(false));
    })
    .catch((err) => {
      console.dir(err);
      dispatch(requestViewUpdateRemoteFailure(err));
      dispatch(
        messageActions.showMessage({
          header: '',
          content: err.response.data.detail,
          type: 'error',
        })
      );
      // dispatch(loadingActions.setLoadingState(false));
    })
    .finally(() => {
      dispatch(loadingActions.setLoadingState(false));
    });
};
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
export const removeViewData = (id) => (dispatch) => {
  dispatch(datasetActions.removeDatasetView(id));
  dispatch(removeView(id));
};
//-------------------------------------------------------------------------------------------------
