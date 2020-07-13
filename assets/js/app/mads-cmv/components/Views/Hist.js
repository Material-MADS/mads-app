// import { connect } from 'react-redux';

import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import QuadBarChart from '../VisComponents/QuadBarChart';
import HistForm from './HistForm';

import convertExtentValues from './FormUtils';

const settings = {
  options: { title: 'Histogram' },
};

class HistView extends withCommandInterface(QuadBarChart, HistForm, settings) {
  handleSelectionChange = (indices) => {
    const { dataset, updateSelection } = this.props;
    const data = this.mapData(dataset);
    console.log(data);

    let selections = [];
    indices.forEach((i) => {
      const idx = data.indices[i];
      selections = [...selections, ...idx];
    });
    console.log(selections);
    updateSelection(selections);
  };

  handleSubmit = (values) => {
    console.log(values);
    const { id, view, updateView, colorTags, actions, dataset } = this.props;

    let newValues = { ...values };
    console.log(newValues);

    // filter out non-existing columns & colorTags
    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    if (!newValues.targetColumns[0] || !newValues.bins) {
      return;
    }

    // extract data
    const df = new DataFrame(dataset.main.data);
    const s = df.get(newValues.targetColumns[0]);
    const data = s.values.toArray();

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

// const mapStateToProps = state => ({
//   dataset: state.dataset,
//   selection: state.selection,
// });

// export default connect(mapStateToProps)(ScatterView);
export default HistView;
