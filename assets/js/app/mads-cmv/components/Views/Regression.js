
/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
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

import RegressionVis from '../VisComponents/RegressionVis';
import RegressionForm from './RegressionForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Custom Settings to pass to the VisComp
//-------------------------------------------------------------------------------------------------
const settings = {
  options: { title: 'Regression' },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class RegressionView extends withCommandInterface( RegressionVis, RegressionForm, settings ) {

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

    // extract data
    const data = {};
    const df = new DataFrame(dataset.main.data);
    const tc = df.get(newValues.targetColumn);
    data[newValues.targetColumn] = tc.values.toArray();

    newValues.featureColumns.forEach((c) => {
      const fc = df.get(c);
      data[c] = fc.values.toArray();
    });

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
    const data = {d1: {data: []}, d2: {data: []}};

    if (dataset[id]) {
      const targetName = view.settings.targetColumn;
      const pName = `${targetName}--Predicted`;
      let xx, yy, xx2, yy2;

      // Make sure backwards compability is implemented so old regression components will still work
      if(dataset[id]['d1']){
        xx = dataset[id]['d1'][targetName];
        yy = dataset[id]['d1'][pName];
        xx2 = dataset[id]['d2'][targetName];
        yy2 = dataset[id]['d2'][pName];
      }
      else if(dataset[id][targetName]){
        xx = dataset[id][targetName];
        yy = dataset[id][pName];
        xx2 = [];
        yy2 = [];
      }

      if (xx == undefined || !Array.isArray(xx) || yy == undefined || !Array.isArray(yy)) {
        return  {};
      }

      xx.forEach((x, i) => {
        const item = {};
        item[targetName] = x;
        item[pName] = yy[i];
        data.d1.data.push(item);
      });

      xx2.forEach((x, i) => {
        const item = {};
        item[targetName] = x;
        item[pName] = yy2[i];
        data.d2.data.push(item);
      });

      if (!(dataset.main.schema.fields.some(e => e.name === this.props.view.settings.targetColumn))) {
        data.d1 = {data: []};
        data.d2 = {data: []};
        data["resetRequest"] = true;
        data["resetTitle"] = "Regression";
      }

      if (dataset[id].scores) {
        data["scores"] = dataset[id].scores;
      }
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------
