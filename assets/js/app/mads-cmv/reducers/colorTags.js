// import initialState from '../stores/AppState';
import { ADD_COLORTAG, REMOVE_COLORTAG, UPDATE_COLORTAG } from '../actions';
import operations from '../operations/colorTags';

function colorTags(state = [], action) {
  switch (action.type) {
    case ADD_COLORTAG:
      return [...state, action.colorTag];
    case REMOVE_COLORTAG:
      return state.filter((c) => c.id !== action.id);
    case UPDATE_COLORTAG:
      return operations.getUpdatedColorTagState(
        state,
        action.id,
        action.properties
      );
    default:
      return state;
  }
}

export default colorTags;
