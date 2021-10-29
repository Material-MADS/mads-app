import api from '../api';
import * as datasetActions from './dataset';
import * as messageActions from './message';

export const ADD_VIEW = 'ADD_VIEW';
export const REMOVE_VIEW = 'REMOVE_VIEW';
export const UPDATE_VIEW = 'UPDATE_VIEW';

export const VIEW_UPDATE_REMOTE_REQUEST = 'VIEW_UPDATE_REMOTE_REQUEST';
export const VIEW_UPDATE_REMOTE_SUCCESS = 'VIEW_UPDATE_REMOTE_SUCCESS';
export const VIEW_UPDATE_REMOTE_FAILURE = 'VIEW_UPDATE_REMOTE_FAILURE';

// Action Creators

export const addView = (view) => ({
  type: ADD_VIEW,
  view,
});

export const removeView = (id) => ({
  type: REMOVE_VIEW,
  id,
});

export const updateView = (id, settings) => {
  // console.log('testtsetsetset', id, settings);
  return {
    type: UPDATE_VIEW,
    id,
    settings,
  };
};

export const requestViewUpdateRemote = (id, view) => {
  //console.log('testtsetsetset', id, settings);
  return {
    type: VIEW_UPDATE_REMOTE_REQUEST,
    id,
    view,
  };
};

export const receiveViewUpdateRemote = (data) => {
  // console.log('testtsetsetset', id, settings);
  return {
    type: VIEW_UPDATE_REMOTE_SUCCESS,
    content: data,
    receiveAt: Date.now(),
  };
};

export const requestViewUpdateRemoteFailure = (error) => ({
  type: VIEW_UPDATE_REMOTE_FAILURE,
  error,
});

export const sendRequestViewUpdate = (view, values, data) => (dispatch) => {
  dispatch(requestViewUpdateRemote());
  view.settings = values;
  dispatch(updateView(values));

  return api.views
    .sendRequestViewUpdate(view, data)
    .then((res) => {
      //console.log(res.data);
      dispatch(receiveViewUpdateRemote(res.data));
      //console.log(res.data);
      // dispatch(updateMainDataset(json));
      dispatch(datasetActions.addDatasetView(view.id, res.data));
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
    });
};

export const removeViewData = (id) => (dispatch) => {
  dispatch(datasetActions.removeDatasetView(id));
  dispatch(removeView(id));
};
