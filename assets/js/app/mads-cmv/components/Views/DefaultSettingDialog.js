import React, { Component } from 'react';
import { Button, Header, Modal } from 'semantic-ui-react';
import PropTypes from 'prop-types';

class DefaultSettingDialog extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  render() {
    const { title, trigger, children, onSubmit } = this.props;

    return (
      // <Modal trigger={<Button>Scrolling Content Modal</Button>}>
      <Modal trigger={trigger}>
        <Modal.Header>{title}</Modal.Header>
        <Modal.Content scrolling>
          <Modal.Description>
            <Header>Modal Header</Header>
            <p>aaa</p>
          </Modal.Description>

          {children}
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={onSubmit}>
            Submit
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

DefaultSettingDialog.propTypes = {
  title: PropTypes.string,
  trigger: PropTypes.node,
  children: PropTypes.node,
  onSubmit: PropTypes.func,
};

DefaultSettingDialog.defaultProps = {
  title: 'Properties',
  trigger: undefined,
  children: [],
  onSubmit: () => {},
};

export default DefaultSettingDialog;
