// import initialState from '../stores/AppState';
import { ADD_VIEW, REMOVE_VIEW, UPDATE_VIEW } from '../actions';
import operations from '../operations/views';

function views(state = [], action) {
  switch (action.type) {
    case ADD_VIEW:
      return [...state, action.view];
    case REMOVE_VIEW:
      return state.filter((view) => view.id !== action.id);
    case UPDATE_VIEW:
      return operations.getUpdatedViewsState(state, action.id, action.settings);
    default:
      return state;
  }
}

export default views;
