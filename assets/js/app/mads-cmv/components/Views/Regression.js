// import { connect } from 'react-redux';
import React from 'react';
import { DataFrame } from 'pandas-js';
import { Button, Modal, Card } from 'semantic-ui-react';
import _ from 'lodash';

import withCommandInterface from './ViewWrapper';
import RegressionVis from '../VisComponents/RegressionVis';
import RegressionForm from './RegressionForm';
// import { withReducer } from 'recompose';

import convertExtentValues from './FormUtils';

const settings = {
  options: { title: 'Regression' },
};

class RegressionView extends withCommandInterface(
  RegressionVis,
  RegressionForm,
  settings
) {
  handleSubmit = (values) => {
    // console.log(values)
    const { id, view, colorTags, actions, dataset, updateView } = this.props;

    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    // filter out featureColumns
    const columns = this.getColumnOptionArray();
    // console.log(columns);
    if (values.featureColumns) {
      const filteredColumns = values.featureColumns.filter((f) =>
        columns.includes(f)
      );
      newValues.featureColumns = filteredColumns;
    }

    // extract data
    const data = {};
    const df = new DataFrame(dataset.main.data);
    const tc = df.get(newValues.targetColumn);
    data[newValues.targetColumn] = tc.values.toArray();
    newValues.featureColumns.forEach((c) => {
      const fc = df.get(c);
      data[c] = fc.values.toArray();
    });

    // set mapping
    newValues.mappings = {
      x: values.targetColumn,
      y: `${values.targetColumn}--predicted`,
    };
    console.warn(newValues.mappings);

    newValues = convertExtentValues(newValues);

    console.log(newValues);
    // TODO: apply filters
    // updateView(id, newValues);

    this.tmpViewParams = { view, newValues, data };
    actions.sendRequestViewUpdate(view, newValues, data);
  };

  handleModelSave = (name, overwrite, id) => {
    // Note: override this if necessary
    console.log('model saving...');
    const { actions } = this.props;

    // submit setting form
    // this.onSubmitClick();
    this.formReference.submit();
    console.log(this.tmpViewParams);
    actions.saveModel(name, this.tmpViewParams, overwrite, id);
    // this.close();
  };

  composeSubmittingData = (values) => {};

  mapData = (dataset) => {
    console.log(dataset);
    const { id, view, actions } = this.props;

    const data = [];

    if (dataset[id]) {
      const targetName = view.settings.targetColumn;
      const pName = `${targetName}--predicted`;
      const xx = dataset[id][targetName];
      const yy = dataset[id][pName];

      if (!xx && !yy) {
        return [];
      }

      xx.forEach((x, i) => {
        const item = {};
        item[targetName] = x;
        item[pName] = yy[i];
        data.push(item);
      });
    }
    console.log(data);
    // actions.update
    return data;
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

    console.log(this.props);

    const { main } = dataset;

    const { propSheetOpen } = this.state;

    const columnOptions = this.getColumnOptions();

    // console.log(colorTags);
    // let { data } = main;
    // // TODO: compose data...
    const data = this.mapData(dataset);
    console.log(dataset);
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
      // console.log(filteredIndices);
    }

    // extract scores
    const scores = {};
    if (dataset[id]) {
      if (dataset[id].scores) {
        const ss = dataset[id].scores;
        console.log(dataset[id].scores);
        if (ss['test_r2']) {
          scores.meanR2 = _.mean(ss['test_r2']);
        }
        if (ss['test_mae']) {
          scores.meanMAE = _.mean(ss['test_mae']);
        }
      }
    }

    return (
      <div className="view-container">
        <Button
          size="mini"
          icon="remove"
          onClick={() => this.onDeleteClick(id)}
        />
        <Button size="mini" icon="configure" onClick={() => this.show()} />

        <div className="view-contents">
          <RegressionVis
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

          <div style={{ marginRight: '5px' }}>
            <Card>
              <Card.Content>
                <h3>CV scores:</h3>
                <ul>
                  <li>mean r2: {scores.meanR2}</li>
                  <li>mean MAE: {scores.meanMAE}</li>
                </ul>
              </Card.Content>
            </Card>
          </div>
        </div>

        <Modal open={propSheetOpen} onClose={this.close}>
          <Modal.Header>
            {view.name} {`[${view.id}]`}
          </Modal.Header>
          <Modal.Content>
            <RegressionForm
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
            {/* <Button positive content="Submit" onClick={this.onSubmitClick} /> */}
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

// export default connect(mapStateToProps)(ScatterView);
export default RegressionView;
