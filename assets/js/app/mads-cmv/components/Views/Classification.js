/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Classification'
//              View
// ------------------------------------------------------------------------------------------------
// Notes: 'Classification' is the manager of all current input that controls the final view of the
//         'Classification' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas libs, Internal ViewWrapper & Form Utility Support,
//             Internal Classification & ClassificationForm libs,
=================================================================================================*/

//*** TODO: Could this be deleted, and just leave the Scatter Plot with some new settings to replace them

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import ClassificationVis from '../VisComponents/ClassificationVis';
import ClassificationForm from './ClassificationForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Custom Settings to pass to the VisComp
//-------------------------------------------------------------------------------------------------
const settings = {
  options: { title: 'Classification' },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class ClassificationView extends withCommandInterface( ClassificationVis, ClassificationForm, settings ) {

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
      y: `${values.targetColumn}--predicted`,
    };

    newValues = convertExtentValues(newValues);

    this.tmpViewParams = { view, newValues, data };
    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages Save Model Requests
  handleModelSave = (name, overwrite, id) => {
    const { actions } = this.props;

    this.formReference.submit();
    actions.saveModel(name, this.tmpViewParams, overwrite, id);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id, view, actions } = this.props;
    const data = [];

    if (dataset[id]) {
      const targetName = view.settings.targetColumn;
      const pName = `${targetName}--predicted`;
      const xx = dataset[id][targetName];
      const yy = dataset[id][pName];

      if (!xx && !yy) {
        return [];
      }

      xx.forEach((x, i) => {
        const item = {};
        item[targetName] = x;
        item[pName] = yy[i];
        data.push(item);
      });
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------
