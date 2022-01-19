/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the main app for the analysis workspace view
// ------------------------------------------------------------------------------------------------
// Notes: When selecting a workspace in analysis, this is where it all runs.
// ------------------------------------------------------------------------------------------------
// References: React + semantic ui react, and various modules from the mads-cmv/containers folder
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, Dimmer, Loader, Image, Segment, } from 'semantic-ui-react';
import DataSourceSelector from './containers/DataSourceSelector';
import CmvBase from './containers/CmvBase';
import ActionPanel from './containers/ActionPanel';
import MessagePanel from './containers/MessagePanel';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
class App extends React.Component {
  static defaultProps = {
    dataSources: [],
  };

  componentDidUpdate(prevProps, prevStates) {
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
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
App.propTypes = {
  isLoading: PropTypes.bool,
};
//-------------------------------------------------------------------------------------------------

export default App;
