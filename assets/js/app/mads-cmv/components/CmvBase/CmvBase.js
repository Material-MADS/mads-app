/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Redux Component for the 'CmvBase' feature/module
// ------------------------------------------------------------------------------------------------
// Notes: 'CmvBase' is the main workspace area of the analysis page that provides us with
//        possibilities that allows us to add different views (visualization components) in order
//        to study the selected data.
// ------------------------------------------------------------------------------------------------
// References: React, prop-types Libs, ColorTags and AddView Containers,
//             and ViewCatalog (available vizualisation components)
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import PropTypes from 'prop-types';

import ColorTags from '../../containers/ColorTags';
import AddViewButton from '../../containers/AddView';
import config from '../Views/ViewCatalog';

import './style.css';

//-------------------------------------------------------------------------------------------------

// *** TODO *** TRYING TO IMPLEMENT MOVABLE VIEWS
// import { Responsive, WidthProvider } from "react-grid-layout" //*** TODO: movable views
// import "react-grid-layout/css/styles.css"; //*** TODO: movable views
// import "react-resizable/css/styles.css"; //*** TODO: movable views
// const ResponsiveReactGridLayout = WidthProvider(Responsive) //*** TODO: movable views

//-------------------------------------------------------------------------------------------------
// The Component Class
//-------------------------------------------------------------------------------------------------
class CmvBase extends React.Component {
  static propTypes = {
    views: PropTypes.arrayOf(PropTypes.any),
    actions: PropTypes.objectOf(PropTypes.any),
    dataset: PropTypes.objectOf(PropTypes.any),
    selection: PropTypes.arrayOf(PropTypes.number),
    colorTags: PropTypes.arrayOf(PropTypes.any),
  };

  static defaultProps = {
    views: [],
    actions: {},
    dataset: {},
    selection: [],
    colorTags: [],
  };

  componentDidMount() {}

  render() {
    const {
      views,
      actions,
      dataset,
      selection,
      colorTags,
      userInfo,
      showMessage,
    } = this.props;

    const viewContainers = views.map((view) => {
      const componentDef = config.find((c) => view.type === c.type);
      if(componentDef){
        const View = componentDef.component;

        return (
          <View
            key={view.id}
            id={view.id}
            view={view}
            dataset={dataset}
            selection={selection}
            colorTags={colorTags}
            removeView={actions.removeViewData}
            updateView={actions.updateView}
            updateSelection={actions.updateSelection}
            actions={actions}
            isLoggedIn={userInfo.isLoggedIn}
            version={componentDef.version}
            devStage={componentDef.devStage}
          />
        );
      }
    });

    return (
      <div>
        <ColorTags />

        <div className="ui divider" />

        <div className="base-container">
          {viewContainers}
          <AddViewButton views={views} />
        </div>
      </div>
    );
  }
}
//-------------------------------------------------------------------------------------------------

export default CmvBase;
