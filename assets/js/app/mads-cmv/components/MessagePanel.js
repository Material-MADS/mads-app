/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of the Custom 'Message Panel' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'Message Panel' is a modal message box for displaying a message that afterwards can be
//        closed and dismissed.
// ------------------------------------------------------------------------------------------------
// References: React & semantic-ui-react Libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { Component } from 'react';
import { Button, Icon, Message, Modal } from 'semantic-ui-react';

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// The Component Class
//-------------------------------------------------------------------------------------------------
class MessagePanel extends Component {
  handleDismiss = () => {
    const { onDismiss } = this.props;
    onDismiss();
  };

  render() {
    const { messageOpen, header, content, type } = this.props;

    return (
      <Modal size="small" open={messageOpen}>
        <Modal.Header>{header}</Modal.Header>

        <Modal.Content>
          {content}
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
