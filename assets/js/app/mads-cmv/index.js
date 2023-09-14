/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the main index for the analysis workspace view
// ------------------------------------------------------------------------------------------------
// Notes: When selecting a workspace in analysis, this is where it all is contained
// ------------------------------------------------------------------------------------------------
// References: React & Redux, JQuery, various modules from various folders in the mads-cmv folder
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import * as workspaceActions from './actions/workspace';
import App from './containers/MadsApp';
import * as reducers from './reducers';
import generalSettings from '../../configSettings'
import $ from 'jquery';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
const middleware = [thunk];

if (process.env.NODE_ENV !== 'production' && !generalSettings.reduxLoggingDisabled) {
  middleware.push(createLogger());
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const appReducer = combineReducers(reducers);
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
const rootReducer = (state, action) => {
  if (action.type === workspaceActions.WORKSPACE_STATE_RESET) {
    const workspace = action.workspace.contents;
    state = {
      ...state,
      colorTags: workspace.colorTags,
      dataSources: {
        ...state.dataSources,
        selectedDataSource: workspace.dataSources.selectedDataSource,
      },
      dataset: workspace.dataset,
      selection: workspace.selection,
      views: workspace.views,
    };
  }

  return appReducer(state, action);
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middleware)),
);
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
$(() => {
  const target = document.getElementById('mads-cmv');
  if (target) {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
      target
    );
  }
});
//-------------------------------------------------------------------------------------------------
