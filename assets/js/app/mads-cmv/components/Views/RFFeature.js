// import { connect } from 'react-redux';

import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
// import QuadBarChart from '../VisComponents/QuadBarChart';
import BarChart from '../VisComponents/BarChart';
import RFFeatureForm from './RFFeatureForm';

import convertExtentValues from './FormUtils';

const settings = {
  options: {
    title: 'Feature Importance (RF)',
    legendLocation: 'top_left',
    extent: { width: 600, height: 400 },
    xaxis_orientation: 'vertical',
  },
};

class RFFeatureView extends withCommandInterface(
  BarChart,
  RFFeatureForm,
  settings
) {
  handleSelectionChange = (indices) => {
    // const { dataset, updateSelection, } = this.props;
    // const data = this.mapData(dataset);
    // console.log(data);
    // let selections = [];
    // indices.forEach((i) => {
    //   const idx = data.indices[i];
    //   selections = [...selections, ...idx];
    // });
    // console.log(selections);
    // updateSelection(selections);
  };

  getSelection = (selection) => {
    // do nothing
  };

  handleSubmit = (values) => {
    console.log(values);

    const { id, view, colorTags, actions, dataset } = this.props;

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
    console.log(columns);
    if (values.featureColumns) {
      const filteredColumns = values.featureColumns.filter((f) =>
        columns.includes(f)
      );
      newValues.featureColumns = filteredColumns;
    }

    if (newValues.featureColumns.length === 0 || !newValues.targetColumn) {
      return;
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

    console.log(data);
    newValues = convertExtentValues(newValues);

    actions.sendRequestViewUpdate(view, newValues, data);
    // updateView(id, newValues);
  };

  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      data = dataset[id];
    }

    return data;
  };
}

export default RFFeatureView;
