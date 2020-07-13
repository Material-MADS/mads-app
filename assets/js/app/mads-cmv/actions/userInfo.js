import api from '../api';

// Action types
export const USER_INFO_REQUEST = 'USER_INFO_REQUEST';
export const USER_INFO_SUCCESS = 'USER_INFO_SUCCESS';
export const USER_INFO_FAILURE = 'USER_INFO_FAILURE';

const requestUserInfo = () => ({
  type: USER_INFO_REQUEST,
});

const receiveUserInfo = (json) => ({
  type: USER_INFO_SUCCESS,
  data: json,
  receivedAt: Date.now(),
});

const getUserInfoFailure = (error) => ({
  type: USER_INFO_FAILURE,
  error,
});

const fetchUserInfo = () => (dispatch) => {
  dispatch(requestUserInfo());
  return api.userInfo
    .fetchUserInfo()
    .then((res) => dispatch(receiveUserInfo(res.data)))
    .catch((err) => dispatch(getUserInfoFailure(err)));
};

export const fetchUserInfoIfNeeded = () => (dispatch, getState) => {
  // console.log(getState());
  return dispatch(fetchUserInfo());
};
