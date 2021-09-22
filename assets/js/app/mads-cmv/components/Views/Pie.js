import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import PieChart from '../VisComponents/PieChart';
import PieForm from './PieForm';

import _ from 'lodash';

import convertExtentValues from './FormUtils';

class PieView extends withCommandInterface(PieChart, PieForm) {

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

    if (newValues.targetColumn == undefined || newValues.bins == undefined) {
      return;
    }

    // extract data
    const df = new DataFrame(dataset.main.data);
    const s = df.get(newValues.targetColumn);
    const data = s.values.toArray();

    newValues = convertExtentValues(newValues);
    newValues['options']['title'] = 'The composition of ' + ((newValues.bins == 0 || typeof data[0] == 'string') ? 'all' : newValues.bins) + ' categories in the column of "' + newValues.targetColumn + '"';

    actions.sendRequestViewUpdate(view, newValues, data);
  };

  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    console.warn(dataset[id]);

    if (dataset[id]) {
      if (dataset.main.schema.fields.some(e => e.name === this.props.view.settings.targetColumn)) {
        data = dataset[id];
      }
      else{
        data["resetRequest"] = true;
      }
    }

    return data;
  };
}

export default PieView;
