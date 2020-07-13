// import DataFrame from 'dataframe-js';
import { Series, DataFrame } from 'pandas-js';
import withCommandInterface from './ViewWrapper';
import Bar from '../VisComponents/BarChart';
import BarForm from './BarForm';

export default class BarView extends withCommandInterface(Bar, BarForm) {
  mapData = (dataSet) => {
    const { data } = dataSet.main;
    const df = new DataFrame(data);
    console.log(df);

    const mappedData = {};

    df.columns.forEach((col) => {
      const ar = df.get(col);
      mappedData[col] = ar.values.toArray();
    });

    console.log(mappedData);
    return mappedData;
  };

  handleSubmit = (values) => {
    // console.log(values)
    const { id, updateView, colorTags } = this.props;

    const newValues = { ...values };

    // filter out non-existing columns & colorTags
    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    if (!values.colorAssignmentEnabled) {
      newValues.mappings.color = '';
    }

    updateView(id, newValues);
  };
}
