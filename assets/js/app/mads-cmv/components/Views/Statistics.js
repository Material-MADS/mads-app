// import { connect } from 'react-redux';

import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
// import QuadBarChart from '../VisComponents/QuadBarChart';
import StatisticsVis from '../VisComponents/StatisticsVis';
import StatisticsForm from './StatisticsForm';

import convertExtentValues from './FormUtils';

const settings = {
  options: {
    title: 'Statistics',
  },
};

class StatisticsView extends withCommandInterface(StatisticsVis, StatisticsForm, settings) {

  handleSubmit = (values) => {
    if(values.featureColumns.length == 0){ throw "No data to work with" }

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
    if (values.featureColumns) {
      const filteredColumns = values.featureColumns.filter((f) =>
        columns.includes(f)
      );
      newValues.featureColumns = filteredColumns;
    }

    const data = {};
    const df = new DataFrame(dataset.main.data);
    newValues.featureColumns.forEach((c) => {
      const fc = df.get(c);
      data[c] = fc.values.toArray();
    });

    newValues = convertExtentValues(newValues);

    actions.sendRequestViewUpdate(view, newValues, data);
  };

  mapData = (dataset) => {
    const { id, view, options } = this.props;
    const data = {
      data: [],
      columns: [],
    };

    if (dataset[id]) {
      return dataset[id];
    }
    return data;
  };
}

export default StatisticsView;
