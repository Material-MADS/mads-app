/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Wrapper Container for all Views that holds the different VisComps
// ------------------------------------------------------------------------------------------------
// Notes: 'ViewWrapper' is the View manager / controller that holds each various VisComp View
//        and gives us the needed interface to remove or edit the VisComp.
// ------------------------------------------------------------------------------------------------
// References: react, prop-types and semantic-ui-react libs, Needed FormField components
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'semantic-ui-react';

import DevStage from '../FormFields/DevStage';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ViewWrapper Package
//-------------------------------------------------------------------------------------------------
export default function withCommandInterface(
  WrappedComponent,
  SettingForm,
  settings = {},
  properties = {}
) {
  // The ViewWrapper Class
  class ViewWrapper extends React.Component {
    state = {
      propSheetOpen: false,
    };

    show = () => {
      this.setState({ propSheetOpen: true });
    };

    close = () => {
      this.setState({ propSheetOpen: false });
    };

    getColumnOptions = () => {
      const { dataset } = this.props;
      const { main } = dataset;

      let columnOptions = [];

      // collect options from the main dataset
      if (main.schema) {
        columnOptions = main.schema.fields.map((f) => ({
          key: f.name,
          text: f.name,
          value: f.name,
        }));
      }

      // collect options from views
      const keys = Object.keys(dataset);

      keys.forEach((k) => {
        if (k === 'main') {
          return;
        }
      });

      return columnOptions;
    };

    getColumnOptionArray = () => {
      const { dataset } = this.props;
      const { main } = dataset;

      let columnOptions = [];
      if (main.schema) {
        columnOptions = main.schema.fields.map((f) => f.name);
      }
      return columnOptions;
    };

    getSelection = (selection) => {
      // Note: override this if necessary
      return selection;
    };

    handleModelSave = (name, overwrite, id) => {
      // Note: override this if necessary
    };

    handleSelectionChange = (indices) => {
      // Note: override this if needed
      const { updateSelection } = this.props;

      updateSelection(indices);
    };

    handleSubmit = (values) => {
      // Note: override this if necessary or more exactly... "handleSubmit" needs to be overridden.
      console.error('"handleSubmit" needs to be overridden.');
    };

    mapData = (dataset) => {
      // Note: override this if you want to have special mappings of data
      return dataset.main.data;
    };

    onSubmitClick = () => {
      this.formReference.submit();

      this.close();
    };

    onDeleteClick = (id) => {
      this.props.removeView(id);
    };

    render() {
      const {
        dataset,
        removeView,
        view,
        id,
        selection,
        colorTags,
        isLoggedIn,
        showMessage,
        actions,
        version,
        devStage
      } = this.props;

      const { main } = dataset;
      const { propSheetOpen } = this.state;
      const columnOptions = this.getColumnOptions();
      const data = this.mapData(dataset);
      const selectionInternal = this.getSelection(selection);

      // compose filtered indices
      let filteredIndices = [];
      if (view.settings.filter) {
        view.settings.filter.forEach((f) => {
          const cTag = colorTags.find((c) => c.id === f);
          if (!cTag) {
            return;
          }
          filteredIndices = filteredIndices.concat(cTag.itemIndices);
        });

        const s = new Set(filteredIndices);
        filteredIndices = Array.from(s);
      }

      // Add the ViewWrapper to the DOM
      return (
        <div className="view-container">
          <Button
            size="mini"
            icon="remove"
            onClick={() => this.onDeleteClick(id)}
          />
          <Button size="mini" icon="configure" onClick={() => this.show()} />
          <DevStage stage={devStage} version={version} />
          <WrappedComponent
            data={data || []}
            {...settings}
            {...view.settings}
            properties={view.properties}
            selectedIndices={selectionInternal}
            colorTags={colorTags}
            filteredIndices={filteredIndices}
            onSelectedIndicesChange={(indices) =>
              this.handleSelectionChange(indices)
            }
            showMessage={actions.showMessage}
          />

          <Modal open={propSheetOpen} onClose={this.close}>
            <Modal.Header>
              {view.name} {`[${view.id}]`}
            </Modal.Header>
            <Modal.Content>
              <SettingForm
                initialValues={view.settings}
                enableReinitialize
                ref={(form) => {
                  this.formReference = form;
                }}
                onSubmit={this.handleSubmit}
                columns={columnOptions}
                targetId={id}
                colorTags={colorTags}
                onModelSave={this.handleModelSave}
                isLoggedIn={isLoggedIn}
              />
            </Modal.Content>
            <Modal.Actions>
              <Button negative onClick={() => this.close()}>
                Cancel
              </Button>
              <Button positive content="Submit" onClick={this.onSubmitClick} />
            </Modal.Actions>
          </Modal>
        </div>
      );
    }
  }

  ViewWrapper.propTypes = {
    dataset: PropTypes.object.isRequired,
  };

  return ViewWrapper;
}
//-------------------------------------------------------------------------------------------------
