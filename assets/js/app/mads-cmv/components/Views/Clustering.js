/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the
//              'K-Means Clustering' View
// ------------------------------------------------------------------------------------------------
// Notes: 'K-Means Clustering' is the manager of all current input that controls the final view of the
//         this specific case of a 'BarChart' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas libs, Internal ViewWrapper & Form Utility Support,
//             Internal PieChart & PieForm libs,
=================================================================================================*/


//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import ClusteringVis from '../VisComponents/ClusteringVis';
import ClusteringForm from './ClusteringForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class ClusteringView extends withCommandInterface( ClusteringVis, ClusteringForm ) {

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

    var data = {};
    if(newValues.visType == "Bar Chart"){
      // filter out featureColumns
      const columns = this.getColumnOptionArray();
      if (values.featureColumns) {
        const filteredColumns = values.featureColumns.filter((f) =>
          columns.includes(f)
        );
        newValues.featureColumns = filteredColumns;
      }

      // extract data
      const df = new DataFrame(dataset.main.data);
      newValues.featureColumns.forEach((c) => {
        const fc = df.get(c);
        data[c] = fc.values.toArray();
      });
    }
    else{
      if (!values.colorAssignmentEnabled) { newValues.mappings.color = ''; }
      data = [...dataset.main.data];
    }

    newValues = convertExtentValues(newValues);

    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id, view } = this.props;
    const data = {};
    const counts = [];

    if (dataset[id]) {
      var testValue = this.props.view.settings.featureColumns[0]
      if (dataset.main.schema.fields.some(e => e.name === testValue)) {
        data.visType = dataset[id].vis_type

        if(data.visType == "Bar Chart"){
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
        else{
          data.cluster = dataset[id].cluster;
          data.data = dataset[id].data;
        }
      }
      else{
        data["resetRequest"] = true;
      }


    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------
