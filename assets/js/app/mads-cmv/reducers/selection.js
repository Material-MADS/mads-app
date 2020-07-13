import { UPDATE_SELECTION } from '../actions';

function selection(state = [], action) {
  switch (action.type) {
    case UPDATE_SELECTION:
      return [...action.items];

    default:
      return state;
  }
}

export default selection;
