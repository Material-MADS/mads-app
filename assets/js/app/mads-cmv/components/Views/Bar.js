// import DataFrame from 'dataframe-js';
import { Series, DataFrame } from 'pandas-js';
import withCommandInterface from './ViewWrapper';
import Bar from '../VisComponents/BarChart';
import BarForm from './BarForm';

import convertExtentValues from './FormUtils';

export default class BarView extends withCommandInterface(Bar, BarForm) {

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

    if (newValues.mappings.dimension == undefined || newValues.mappings.measures == undefined) {
      return;
    }

    // extract data
    const df = new DataFrame(dataset.main.data);
    const s1 = df.get(newValues.mappings.dimension);
    const s2 = df.get(newValues.mappings.measures);
    const data = {};
    data[newValues.mappings.dimension] = s1.values.toArray();
    data[newValues.mappings.measures] = s2.values.toArray();

    newValues = convertExtentValues(newValues);
    newValues['options']['title'] = 'The value of "' + newValues.mappings.measures + '" for each "' + newValues.mappings.dimension + '"';
    newValues.mappings.measures = [newValues.mappings.measures];

    console.warn(newValues);
    console.warn(data)
    actions.sendRequestViewUpdate(view, newValues, data);
  };

  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    console.warn('dataset');
console.warn(dataset);
console.warn(this.props.view.settings);

    if (dataset[id]) {
      if (dataset.main.schema.fields.some(e => e.name === this.props.view.settings.mappings.dimension)) {
        data = dataset[id];
      }
      else{
        data["resetRequest"] = true;
      }
    }

    console.warn("leaving mapdata")
console.warn(data)
    return data;

    // const { data } = dataSet.main;
    // const df = new DataFrame(data);
    // console.log(df);

    // const mappedData = {};

    // df.columns.forEach((col) => {
    //   const ar = df.get(col);
    //   mappedData[col] = ar.values.toArray();
    // });

    // console.log(mappedData);
    // return mappedData;
  };
}
