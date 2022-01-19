/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the offered server side API for each feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'index' exports an api module that let us access all other modules server side methods
// ------------------------------------------------------------------------------------------------
// References: 3rd part lib axios and js-cookie. internal datasources, views, userinfo,
//             workspace and prediction
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import axios from 'axios';
import Cookies from 'js-cookie';

import datasources from './datasources';
import views from './views';
import userInfo from './userInfo';
import workspace from './workspace';
import prediction from './prediction';

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
const getClient = () => {
  const csrfToken = Cookies.get('csrftoken');
  const headers = {
    'X-CSRFToken': csrfToken,
  };

  const client = axios.create({ headers });
  return client;
};
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
const api = {};

api.datasources = datasources(getClient);
api.views = views(getClient);
api.userInfo = userInfo(getClient);
api.workspace = workspace(getClient);
api.prediction = prediction(getClient);

export default api;

//-------------------------------------------------------------------------------------------------
