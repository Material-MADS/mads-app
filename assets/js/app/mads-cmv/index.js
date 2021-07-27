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


const middleware = [thunk];
if (process.env.NODE_ENV !== 'production' && !generalSettings.reduxLoggingDisabled) {
  middleware.push(createLogger());
}

// for redux-devtools-extension
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const appReducer = combineReducers(reducers);
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
      dependencies: workspace.dependencies,
      selection: workspace.selection,
      views: workspace.views,
    };
    // state.colorTags
  }

  return appReducer(state, action);
};

// const store = createStore(rootReducer, applyMiddleware(...middleware));
const store = createStore(
  rootReducer,
  /* preloadedState, */ composeEnhancers(applyMiddleware(...middleware))
);

$(document).ready(() => {
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
