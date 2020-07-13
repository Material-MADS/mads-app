import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import Scatter from '../VisComponents/Scatter';

import bData from '../VisComponents/testdata/response-ex';

import style from './style.css';

console.log(style);

class ViewContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    // this.apiClient = props.apiClient;
  }

  componentDidMount() {}

  render() {
    const { removeView, id } = this.props;

    return (
      <div className="view-container">
        <Button icon="remove" onClick={() => removeView(id)} />
        <Button icon="configure" />
        <Scatter
          data={bData.data}
          mappings={{
            x: 'Formation Energy (eV)',
            y: 'Band Gap (eV)',
          }}
        />
      </div>
    );
  }
}

ViewContainer.propTypes = {
  id: PropTypes.string.isRequired,
  removeView: PropTypes.func.isRequired,
};

export default ViewContainer;
