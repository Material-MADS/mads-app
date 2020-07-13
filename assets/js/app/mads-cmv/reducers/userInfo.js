import {
  USER_INFO_REQUEST,
  USER_INFO_SUCCESS,
  USER_INFO_FAILURE,
} from '../actions';

function userInfo(state = {}, action) {
  switch (action.type) {
    case USER_INFO_REQUEST:
      return {
        user: null,
        isLoggedIn: false,
      };
    case USER_INFO_SUCCESS:
      if (Object.keys(action.data).length > 0) {
        return {
          user: action.data,
          isLoggedIn: true,
        };
      }

      return {
        isLoggedIn: false,
      };

    case USER_INFO_FAILURE:
      return {
        user: null,
        isLoggedIn: false,
      };
    default:
      return state;
  }
}

export default userInfo;
