// import DataFrame from 'dataframe-js';
import { Series, DataFrame } from 'pandas-js';
import withCommandInterface from './ViewWrapper';
import Bar from '../VisComponents/BarChart';
import BarForm from './BarForm';

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

    console.warn(newValues);

    // extract data
    const df = new DataFrame(dataset.main.data);
    const s = df.get(newValues.mappings.dimension);
    const data = s.values.toArray();

    console.warn(data);

    newValues = convertExtentValues(newValues);
    newValues['options']['title'] = 'The composition of ' + ((newValues.bins == 0 || typeof data[0] == 'string') ? 'all' : newValues.bins) + ' categories in the column of "' + newValues.targetColumn + '"';

    actions.sendRequestViewUpdate(view, newValues, data);
    // updateView(id, newValues);


    // const { id, updateView, colorTags } = this.props;
    // const newValues = { ...values };

    // // filter out non-existing columns & colorTags
    // if (values.filter) {
    //   const colorTagIds = colorTags.map((c) => c.id);
    //   const filteredFilters = values.filter.filter((f) =>
    //     colorTagIds.includes(f)
    //   );
    //   newValues.filter = filteredFilters;
    // }

    // if (!values.colorAssignmentEnabled) {
    //   newValues.mappings.color = '';
    // }

    // updateView(id, newValues);
  };

  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      if (dataset.main.schema.fields.some(e => e.name === this.props.view.settings.targetColumn)) {
        data = dataset[id];
      }
      else{
        data["resetRequest"] = true;
      }
    }

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
