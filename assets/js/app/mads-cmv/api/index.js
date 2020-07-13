import axios from 'axios';
import Cookies from 'js-cookie';

import datasources from './datasources';
import views from './views';
import userInfo from './userInfo';
import workspace from './workspace';
import prediction from './prediction';

const getClient = () => {
  const csrfToken = Cookies.get('csrftoken');
  const headers = {
    'X-CSRFToken': csrfToken,
  };

  const client = axios.create({ headers });
  return client;
};

// const exportedAPI = process.env.NODE_ENV === 'development' ? mockAPI : realAPI;
const api = {};

api.datasources = datasources(getClient);
api.views = views(getClient);
api.userInfo = userInfo(getClient);
api.workspace = workspace(getClient);
api.prediction = prediction(getClient);

export default api;
