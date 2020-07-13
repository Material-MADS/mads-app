// import { connect } from 'react-redux';
import { DataFrame } from 'pandas-js';

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
}

// export default connect(mapStateToProps)(ScatterView);
export default RegressionView;
