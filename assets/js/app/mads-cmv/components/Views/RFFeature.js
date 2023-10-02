/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'RFFeature' View
// ------------------------------------------------------------------------------------------------
// Notes: 'RFFeature' (Feature Importance) is the manager of all current input that controls the
//         final view of this specific case of a 'BarChart' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas libs, Internal ViewWrapper & Form Utility Support,
//             Internal BarChart & RFFeatureForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import BarChart from '../VisComponents/BarChart';
import RFFeatureForm from './RFFeatureForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Custom Settings to pass to the VisComp
//-------------------------------------------------------------------------------------------------
const settings = {
  options: {
    title: 'Feature Importance (RF)',
    legendLocation: 'top_left',
    extent: { width: 600, height: 400 },
    xaxis_orientation: 'vertical',
  },
};

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class RFFeatureView extends withCommandInterface( BarChart, RFFeatureForm, settings ) {

  // Manages data selection changes in the view
  handleSelectionChange = (indices) => {
  };

  getSelection = (selection) => {
    // do nothing
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

    if (newValues.featureColumns.length === 0 || !newValues.targetColumn) {
      return;
    }

    // extract data
    const data = {};
    const df = new DataFrame(dataset.main.data);
    const tc = df.get(newValues.targetColumn);
    data[newValues.targetColumn] = tc.values.toArray();
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
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      data = dataset[id];
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------
