/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'MolTable' View
// ------------------------------------------------------------------------------------------------
// Notes: 'MolTable' is the manager of all current input that controls the final view of the
//         'MolTable' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support,
//             Internal MolTable & MolTableForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import MolTable from '../VisComponents/MolTableVis';
import MolTableForm from './MolTableForm';

import { DataFrame } from 'pandas-js';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class MolTableView extends withCommandInterface(MolTable, MolTableForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, dataset, actions } = this.props;
    const data = dataset.main.data

    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    const options = this.getColumnOptionArray();
    const filteredColumns = values.columns.filter((c) => options.includes(c));
    newValues.columns = filteredColumns;
    const filteredSmiColumns = values.smiles_columns.filter((c) => options.includes(c));
    newValues.smiles_columns = filteredSmiColumns;

    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    newValues = convertExtentValues(newValues);
    actions.sendRequestViewUpdate(view, newValues, data);
    // updateView(id, newValues);
  };

  composeSubmittingData = (values) => {};

  // Manages data changes in the view
  mapData = (dataset) => {
    const {id, view, actions } = this.props;
    if (dataset[id]) {
       return dataset[id].data.data
    }
    else { return dataset.main.data };
  }

}
//-------------------------------------------------------------------------------------------------
