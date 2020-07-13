import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Menu,
  Dimmer,
  Loader,
  Image,
  Segment,
} from 'semantic-ui-react';

import client from 'axios';
import Cookies from 'js-cookie';

import DataSourceSelector from './containers/DataSourceSelector';
import CmvBase from './containers/CmvBase';
import ActionPanel from './containers/ActionPanel';
import MessagePanel from './containers/MessagePanel';

import '../css/default.css';

class App extends React.Component {
  static defaultProps = {
    dataSources: [],
  };

  componentDidUpdate(prevProps, prevStates) {
    console.log('did update!!!');
  }

  render() {
    const { isLoading } = this.props;

    return (
      <div>
        <Menu borderless>
          <Menu.Item>
            <DataSourceSelector />
          </Menu.Item>

          <Menu.Item position="right">
            <ActionPanel />
          </Menu.Item>
        </Menu>

        <div className="ui divider" />

        <CmvBase />

        <MessagePanel />

        <Dimmer active={isLoading} page>
          <Loader size="small">Loading</Loader>
        </Dimmer>
      </div>
    );
  }
}

App.propTypes = {
  isLoading: PropTypes.bool,
};

export default App;
