import {
  DATASOURCES_REQUEST,
  DATASOURCES_SUCCESS,
  DATASOURCES_FAILURE,
  DATASOURCES_CONTENT_REQUEST,
  DATASOURCES_CONTENT_SUCCESS,
  DATASOURCES_CONTENT_FAILURE,
  SELECT_DATASOUCE,
} from '../actions';

const initialState = {
  isFetching: false,
  items: [],
  selectedDataSource: '',
};

const dataSources = (state = initialState, action) => {
  switch (action.type) {
    case DATASOURCES_REQUEST:
      return {
        ...state,
        isFetching: true,
        items: [],
      };
    case DATASOURCES_SUCCESS:
      return {
        ...state,
        isFetching: false,
        items: action.dataSources,
        lastUpdated: action.receivedAt,
      };
    case DATASOURCES_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.error,
      };

    case SELECT_DATASOUCE:
      return {
        ...state,
        selectedDataSource: action.id,
      };

    case DATASOURCES_CONTENT_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case DATASOURCES_CONTENT_SUCCESS:
      return {
        ...state,
        isFetching: false,
        // dataset: action.content,
        lastUpdated: action.receivedAt,
      };
    case DATASOURCES_CONTENT_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.error,
      };

    default:
      return state;
  }
};

export default dataSources;
