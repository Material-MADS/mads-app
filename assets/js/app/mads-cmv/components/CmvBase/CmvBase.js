import React from 'react';
import PropTypes from 'prop-types';

import ColorTags from '../../containers/ColorTags';
import AddViewButton from '../../containers/AddView';
import config from '../Views/ViewCatalog';

import './style.css';

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
      const View = componentDef.component;
      // console.log(View);
      return (
        <View
          key={view.id}
          id={view.id}
          view={view}
          dataset={dataset}
          selection={selection}
          colorTags={colorTags}
          removeView={actions.removeView}
          updateView={actions.updateView}
          updateSelection={actions.updateSelection}
          actions={actions}
          isLoggedIn={userInfo.isLoggedIn}
        />
      );
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

export default CmvBase;
