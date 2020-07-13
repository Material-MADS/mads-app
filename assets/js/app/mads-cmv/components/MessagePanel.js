import React, { Component } from 'react';
import { Button, Icon, Message, Modal } from 'semantic-ui-react';

class MessagePanel extends Component {
  handleDismiss = () => {
    // this.setState({ visible: false })
    const { onDismiss } = this.props;
    onDismiss();
  };

  render() {
    const { messageOpen, header, content, type } = this.props;

    return (
      // <Message
      //   floating
      //   onDismiss={this.handleDismiss}
      //   header="Welcome back!"
      //   content="This is a special notification which you can dismiss."
      //   visible={messageOpen}
      //   hidden={}
      // />
      <Modal size="small" open={messageOpen}>
        <Modal.Header>{header}</Modal.Header>

        <Modal.Content>
          {content}
          {/* <Message
            // floating
            // onDismiss={this.handleDismiss}
            header={header}
            content={content}
          /> */}
        </Modal.Content>

        <Modal.Actions>
          <Button primary onClick={this.handleDismiss}>
            Dismiss
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default MessagePanel;
