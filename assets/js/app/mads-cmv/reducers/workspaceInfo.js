import {
  WORKSPACE_INFO_REQUEST,
  WORKSPACE_INFO_SUCCESS,
  WORKSPACE_INFO_FAILURE,
} from '../actions';

function userInfo(state = {}, action) {
  switch (action.type) {
    case WORKSPACE_INFO_REQUEST:
      return {
        isStored: false,
      };

    case WORKSPACE_INFO_SUCCESS:
      if (Object.keys(action.data).length > 0) {
        return {
          ...action.data,
          isStored: true,
        };
      }

      return {
        isStored: false,
      };

    case WORKSPACE_INFO_FAILURE:
      return {
        isStored: false,
      };
    default:
      return state;
  }
}

export default userInfo;
