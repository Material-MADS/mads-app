import React from 'react';
import PropTypes from 'prop-types';
import { Button, Confirm, Modal } from 'semantic-ui-react';

import WorkspaceNameForm from './WorkspaceNameForm';
import api from '../../api';

class ActionPanel extends React.Component {
  state = {
    saveDialogOpen: false,
    confirmOpen: false,
  };

  UNSAFE_componentWillMount() {
    const { onMount } = this.props;
    if (onMount) {
      onMount();
    }
  }

  confirm = () => {
    const promise = new Promise((resolve, reject) => {
      this.setState({ confirmOpen: true });
      this.resolve = resolve;
    });

    return promise;
  };

  handleConfirm = () => {
    this.setState({ confirmOpen: false });
    if (this.resolve) {
      this.resolve(true);
    }
  };

  handleCancel = () => {
    this.setState({ confirmOpen: false });
    if (this.resolve) {
      this.resolve(false);
    }
  };

  handleSubmit = async (values) => {
    const { onSave } = this.props;

    const res = await api.workspace.fetchOwnedWorkspace();
    const ownedWorkspaces = res.data;

    const pre = ownedWorkspaces.find((w) => w.name === values.name);
    if (pre) {
      // const response = window.confirm('A workspace with the same name is existing. Do you want to overwrite it?');
      const response = await this.confirm();

      if (response) {
        // overwrite the existing workspace
        if (onSave) {
          onSave(values.name, true, pre.id);
        }
        return true;
      }

      // do nothing go back to the dialog
      return false;
    }

    if (onSave) {
      onSave(values.name, false);
    }
    return true;
  };

  showSaveDialog = () => {
    this.setState({ saveDialogOpen: true });
  };

  closeSaveDialog = () => {
    this.setState({ saveDialogOpen: false });
  };

  onSaveClick = async () => {
    const result = await this.formReference.submit();
    if (result) {
      this.closeSaveDialog();
    }
  };

  onSettingClick = () => {
    window.location.href = Urls['analysis:workspace-update'](
      window.workspaceId
    );
  };

  render() {
    const { saveDialogOpen, confirmOpen } = this.state;
    const { isLoggedIn, workspaceInfo } = this.props;

    return (
      <div>
        <Button
          primary
          onClick={this.onSettingClick}
          disabled={!workspaceInfo.isStored}
          data-testid="setting"
        >
          Setting
        </Button>
        <Button
          primary
          onClick={() => this.showSaveDialog()}
          disabled={!isLoggedIn}
        >
          Save
        </Button>
        <Modal open={saveDialogOpen} onClose={this.closeSaveDialog}>
          <Modal.Header>Save Workspace</Modal.Header>
          <Modal.Content>
            <WorkspaceNameForm
              initialValues={workspaceInfo}
              // enableReinitialize
              ref={(form) => {
                this.formReference = form;
              }}
              onSubmit={this.handleSubmit}
              // columns={columnOptions}
              // targetId={id}
              // colorTags={colorTags}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button negative onClick={() => this.closeSaveDialog()}>
              Cancel
            </Button>
            <Button positive content="Save" onClick={this.onSaveClick} />
          </Modal.Actions>
        </Modal>

        <Confirm
          open={confirmOpen}
          onCancel={this.handleCancel}
          onConfirm={this.handleConfirm}
          content="A workspace with the same name is existing. Do you want to overwrite it?"
        />
      </div>
    );
  }
}

ActionPanel.defaultProps = {
  workspaceInfo: {},
};

ActionPanel.propType = {
  isLoggedIn: PropTypes.bool,
  workspaceInfo: PropTypes.object,
};

export default ActionPanel;
