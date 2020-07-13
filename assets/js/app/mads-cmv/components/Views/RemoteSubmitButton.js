import React from 'react';
import { connect } from 'react-redux';
import { submit } from 'redux-form';

import { Button } from 'semantic-ui-react';

const RemoteSubmitButton = ({ dispatch }) => (
  <Button
    positive
    content="Submit"
    onClick={() => dispatch(submit('remoteSubmit'))}
  />
);

export default connect()(RemoteSubmitButton);
