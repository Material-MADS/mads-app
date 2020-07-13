import React from 'react';
import PropTypes from 'prop-types';

import 'semantic-ui-css/semantic.min.css';

import { Button } from 'semantic-ui-react';

import Scatter from '../VisComponents/Scatter';

// import $ from 'jquery';
// import 'semantic-ui-css';

class SimpleChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    // this.apiClient = props.apiClient;
  }

  componentDidMount() {}

  render() {
    const { removeView, id } = this.props;

    return (
      <div>
        <Button icon="remove" onClick={() => removeView(id)} />
        <Button icon="configure" />
        <Scatter />
      </div>
    );
  }
}

SimpleChart.propTypes = {
  id: PropTypes.string.isRequired,
  chartSettings: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }).isRequired,
  removeView: PropTypes.func.isRequired,
};

SimpleChart.defaultProps = {};

export default SimpleChart;
