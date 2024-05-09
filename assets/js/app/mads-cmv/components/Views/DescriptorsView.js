/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Regression' View
// ------------------------------------------------------------------------------------------------
// Notes: 'Regression' is the manager of all current input that controls the final view of the
//         'RegressionVis' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas & lodash libs, Internal ViewWrapper & Form Utility Support,
//             Internal PieChart & PieForm libs,
=================================================================================================*/

//*** TODO: This is not structured the same way as other Views, should probably be adjusted to do that

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
//      const colorTagIds = colorTags.map((c) => c.id);
//      const filteredFilters = values.filter.filter((f) =>
//        colorTagIds.includes(f)
//      );
      newValues.filter = values.filter;
    }

    // filter out featureColumns
    const columns = this.getColumnOptionArray();
    if (values.featureColumns) {
//      const filteredColumns = values.featureColumns.filter((f) =>
//        columns.includes(f)
//      );
      newValues.featureColumns = values.featureColumns;
    }

    // extract data
    const data = {};
    const df = new DataFrame(dataset.main.data);
    const tc = df.get(newValues.targetColumn);
    data[newValues.targetColumn] = tc.values.toArray();
    const fc = df.get(newValues.featureColumns);
    data[newValues.featureColumns] = fc.values.toArray();

//    newValues.featureColumns.forEach((c) => {
//      const fc = df.get(c);
//      data[c] = fc.values.toArray();
//    });

    // set mapping
    newValues.mappings = {
      x: values.targetColumn,
      y: `${values.targetColumn}--Predicted`,
    };

    newValues = convertExtentValues(newValues);

    this.tmpViewParams = { view, newValues, data };
    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages Save Model Requests
  handleModelSave = (name, overwrite, id) => {
    // Note: override this if necessary
    const { actions } = this.props;

    // submit setting form
    this.formReference.submit();
    actions.saveModel(name, this.tmpViewParams, overwrite, id);
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
