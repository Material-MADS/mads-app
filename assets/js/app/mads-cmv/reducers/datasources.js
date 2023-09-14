/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: These are the available reducers for the 'Datasource' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'Data source' let us load various data
// ------------------------------------------------------------------------------------------------
// References: Datasource actions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import {
  DATASOURCES_REQUEST,
  DATASOURCES_SUCCESS,
  DATASOURCES_FAILURE,
  DATASOURCES_CONTENT_REQUEST,
  DATASOURCES_CONTENT_SUCCESS,
  DATASOURCES_CONTENT_FAILURE,
  SELECT_DATASOUCE,
} from '../actions';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer initialState for this module/feature
//-------------------------------------------------------------------------------------------------
const initialState = {
  isFetching: false,
  items: [],
  selectedDataSource: '',
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Reducer method for this module/feature
//-------------------------------------------------------------------------------------------------
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
//-------------------------------------------------------------------------------------------------

export default dataSources;
