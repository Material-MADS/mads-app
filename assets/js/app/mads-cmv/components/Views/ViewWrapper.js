import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Dropdown, Form } from 'semantic-ui-react';

import { DepGraph } from 'dependency-graph';

function withCommandInterface(
  WrappedComponent,
  SettingForm,
  settings = {},
  properties = {}
) {
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

      // window.DepGraph = DepGraph;

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
      console.log('model saving...');
    };

    handleSelectionChange = (indices) => {
      // Note: override this if needed
      const { updateSelection } = this.props;
      // console.log('selected!!!', indices);

      // console.trace();
      updateSelection(indices);
    };

    handleSubmit = (values) => {
      // Note: override this if necessary
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
      } = this.props;

      //console.log(this.props);

      const { main } = dataset;

      const { propSheetOpen } = this.state;

      const columnOptions = this.getColumnOptions();

      // console.log(colorTags);
      // let { data } = main;
      // // TODO: compose data...
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

      return (
        <div className="view-container">
          <Button
            size="mini"
            icon="remove"
            onClick={() => this.onDeleteClick(id)}
          />
          <Button size="mini" icon="configure" onClick={() => this.show()} />
          <WrappedComponent
            data={data || []}
            {...settings}
            {...view.settings}
            properties={view.properties}
            // mappings={mappings}
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

export default withCommandInterface;
