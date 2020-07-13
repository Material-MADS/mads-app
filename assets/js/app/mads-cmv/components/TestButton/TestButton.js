import React from 'react';
// import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const styles = {
  border: '1px solid #eee',
  borderRadius: 3,
  backgroundColor: '#FFFFFF',
};

const TestButton = ({ children, onClick }) => (
  <button onClick={onClick} style={styles} type="button">
    {children}
  </button>
);

TestButton.displayName = 'Button';
TestButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};
TestButton.defaultProps = {
  onClick: () => {},
};

export default TestButton;
