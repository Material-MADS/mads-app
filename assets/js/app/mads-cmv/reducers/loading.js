import { SET_LOADING_STATE } from '../actions';

const initialState = {
  isLoading: false,
};

function loading(state = initialState, action) {
  switch (action.type) {
    case SET_LOADING_STATE:
      return {
        isLoading: action.state,
      };

    default:
      return state;
  }
}

export default loading;
