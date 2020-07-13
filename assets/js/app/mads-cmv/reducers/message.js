import { SET_MESSAGE, SET_MESSAGE_OPEN } from '../actions';

const initialState = {
  messageOpen: false,
  header: '',
  content: '',
  type: '',
};

function message(state = initialState, action) {
  switch (action.type) {
    case SET_MESSAGE:
      return {
        ...state,
        ...action.message,
      };

    case SET_MESSAGE_OPEN:
      return {
        ...state,
        messageOpen: action.state,
      };

    default:
      return state;
  }
}

export default message;
