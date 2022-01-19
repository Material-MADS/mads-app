/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Clustering' View
// ------------------------------------------------------------------------------------------------
// Notes: 'Clustering' is the manager of all current input that controls the final view of the
//         this specific case of a 'BarChart' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas libs, Internal ViewWrapper & Form Utility Support,
//             Internal PieChart & PieForm libs,
=================================================================================================*/

//*** TODO: Could this be deleted, and just leave the BarChart with some new settings to replace them

// Manages data selection changes in the view
  // Manages config settings changes (passed by the connected form) in the view
  // Manages data changes in the view

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import BarChart from '../VisComponents/BarChart';
import ClusteringForm from './ClusteringForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Custom Settings to pass to the VisComp
//-------------------------------------------------------------------------------------------------
const settings = {
  options: {
    title: 'Clustering',
  },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class ClusteringView extends withCommandInterface( BarChart, ClusteringForm, settings ) {

  // Manages data selection changes in the view
  handleSelectionChange = (indices) => {
    if (indices.length === 0) {
      return;
    }

    const { dataset, updateSelection, id } = this.props;

    let selections = [];
    const { cluster } = dataset[id];
    indices.forEach((cid) => {
      const sel = cluster.forEach((i, ii) => {
        if (i === cid) {
          selections.push(ii);
        }
      });
    });

    updateSelection(selections);
  };

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
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

    // extract data
    const data = {};
    const df = new DataFrame(dataset.main.data);
    newValues.featureColumns.forEach((c) => {
      const fc = df.get(c);
      data[c] = fc.values.toArray();
    });

    newValues = convertExtentValues(newValues);

    actions.sendRequestViewUpdate(view, newValues, data);
    // updateView(id, newValues);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id, view } = this.props;
    const data = {};
    const counts = [];

    if (dataset[id]) {
      const cids = dataset[id].cluster;
      const cidsStr = [];
      const noc = view.settings.numberOfClusters;
      for (let i = 0; i < noc; i++) {
        const c = cids.filter((x) => x === i).length;
        counts.push(c);
        cidsStr.push(i.toString());
      }

      data.cids = cidsStr;
      data.counts = counts;
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------
