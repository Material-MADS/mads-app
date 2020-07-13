// import { connect } from 'react-redux';

import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
// import QuadBarChart from '../VisComponents/QuadBarChart';
import BarChart from '../VisComponents/BarChart';
import ClusteringForm from './ClusteringForm';

import convertExtentValues from './FormUtils';

const settings = {
  options: {
    title: 'Clustering',
    // legendLocation: 'top_left',
    // extent: { width: 600, height: 400 },
    // xaxis_orientation: 'vertical',
  },
};

class ClusteringView extends withCommandInterface(
  BarChart,
  ClusteringForm,
  settings
) {
  handleSelectionChange = (indices) => {
    console.log('clustering selection changed', indices);
    if (indices.length === 0) {
      return;
    }

    const { dataset, updateSelection, id } = this.props;

    let selections = [];
    const { cluster } = dataset[id];
    // console.log(cluster);
    indices.forEach((cid) => {
      const sel = cluster.forEach((i, ii) => {
        // console.log(i, ii)
        if (i === cid) {
          selections.push(ii);
        }
      });

      // selections = selections.concat(sel);
    });

    console.log(selections);

    updateSelection(selections);
  };

  // getSelection = selection => {
  //   // do nothing
  //   console.log("sel", selection);
  //   return selection;
  //   // return [];
  // };

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

    // extract data
    const data = {};
    const df = new DataFrame(dataset.main.data);
    // const tc = df.get(newValues.targetColumn);
    // data[newValues.targetColumn] = tc.values.toArray();
    newValues.featureColumns.forEach((c) => {
      const fc = df.get(c);
      data[c] = fc.values.toArray();
    });

    newValues = convertExtentValues(newValues);

    console.log(data);
    // TODO: apply filters

    actions.sendRequestViewUpdate(view, newValues, data);
    // updateView(id, newValues);
  };

  mapData = (dataset) => {
    console.log(dataset);
    const { id, view } = this.props;

    const data = {};

    const counts = [];
    if (dataset[id]) {
      const cids = dataset[id].cluster;
      const cidsStr = [];
      const noc = view.settings.numberOfClusters;
      console.log(noc);
      for (let i = 0; i < noc; i++) {
        const c = cids.filter((x) => x === i).length;
        console.log(c);
        // counts.push(c);
        counts.push(c);
        cidsStr.push(i.toString());
      }

      data.cids = cidsStr;
      data.counts = counts;
      console.log(data);
    }

    return data;
  };
}

export default ClusteringView;
