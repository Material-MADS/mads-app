/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Philippe Gantzer (Component Developer) [2024-]
//          Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Descriptors' View
// ------------------------------------------------------------------------------------------------
// Notes: 'Descriptors' is the manager of all current input that controls the final view of the
//         'DescriptorsVis' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas & lodash libs, Internal ViewWrapper & Form Utility Support,
//             Internal PieChart & PieForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';
import _ from 'lodash';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import DescriptorsVis from '../VisComponents/DescriptorsVis';
import DescriptorsForm from './DescriptorsForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Custom Settings to pass to the VisComp
//-------------------------------------------------------------------------------------------------
const settings = {
  options: { title: 'Descriptors' },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class DescriptorsView extends withCommandInterface( DescriptorsVis, DescriptorsForm, settings ) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, colorTags, actions, dataset, updateView } = this.props;
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

    // filter out numericalFeatureColumns
    if (values.numericalFeatureColumns && values.numericalFeatureColumns.length > 0) {
      const filteredColumns2 = values.numericalFeatureColumns.filter((f) =>
        columns.includes(f)
      );
      newValues.numericalFeatureColumns = filteredColumns2;
    }

    // extract data
    const data = {};
    const df = new DataFrame(dataset.main.data);
    const tc = df.get(newValues.targetColumn);
    data[newValues.targetColumn] = tc.values.toArray();
    const fc = df.get(newValues.featureColumns);
    newValues.featureColumns.forEach((c) => {
      const fc = df.get(c);
      data[c] = fc.values.toArray();
    });
    if(values.numericalFeatureColumns && values.numericalFeatureColumns.length > 0) {
      const nfc = df.get(newValues.numericalFeatureColumns);
      newValues.numericalFeatureColumns.forEach((c) => {
        const nfc = df.get(c);
        data[c] = nfc.values.toArray();
      });
    };
    if(values.solventColumn) {
      const sc = df.get(newValues.solventColumn);
      data[newValues.solventColumn] = sc.values.toArray();
    };

    // set mapping
    newValues.mappings = {
      x: values.targetColumn,
      y: `${values.targetColumn}--Predicted`,
    };
    newValues = convertExtentValues(newValues);

    actions.sendRequestViewUpdate(view, newValues, data);
  };

  composeSubmittingData = (values) => {};

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id, view, actions } = this.props;
    const data = {data: [], data_desc: []};

    console.log("DATASET", dataset)
    if (dataset[id]) {
      if (dataset[id].data_desc == undefined) {
        console.log("undef, return {}")
        return  {};
      }
      if (dataset[id].data_desc) {
        data.data_desc = dataset[id].data_desc
        console.log("not undef, returns good")
      }
    }
    return data;
  };
}
//-------------------------------------------------------------------------------------------------
