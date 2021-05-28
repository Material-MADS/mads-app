import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import PieChart from '../VisComponents/PieChart';
import PieForm from './PieForm';

import _ from 'lodash';

import convertExtentValues from './FormUtils';

const settings = {
  options: { title: 'Pie' },
};

class PieView extends withCommandInterface(PieChart, PieForm, settings) {

  handleSelectionChange = (indices) => {
    const { dataset, updateSelection } = this.props;
    const data = this.mapData(dataset);

    let selections = [];
    indices.forEach((i) => {
      const idx = data.indices[i];
      selections = [...selections, ...idx];
    });
    console.log(selections);
    updateSelection(selections);
  };

  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

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

export default PieView;
