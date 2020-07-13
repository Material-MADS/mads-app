import {
  DATASET_MAIN_UPDATE,
  DATASET_ADD_VIEW,
  DATASET_REMOVE_VIEW,
} from '../actions';

const initialState = {
  main: {},
};

const dataset = (state = initialState, action) => {
  switch (action.type) {
    case DATASET_MAIN_UPDATE:
      return {
        ...state,
        main: action.data,
      };
    case DATASET_ADD_VIEW:
      return {
        ...state,
        [action.id]: action.data,
      };
    case DATASET_REMOVE_VIEW:
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default dataset;
