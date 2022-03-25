/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Pie' Chart View
// ------------------------------------------------------------------------------------------------
// Notes: 'Pie' is the manager of all current input that controls the final view of the
//         'PieChart' visualization component.
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

import PieChart from '../VisComponents/PieChart';
import PieForm from './PieForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class PieView extends withCommandInterface(PieChart, PieForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    if (newValues.targetColumn == undefined || newValues.bins == undefined) {
      return;
    }

    // extract data
    const df = new DataFrame(dataset.main.data);
    const s = df.get(newValues.targetColumn);
    const data = s.values.toArray();

    newValues = convertExtentValues(newValues);
    newValues['options']['title'] = 'The composition of ' + ((newValues.bins == 0 || typeof data[0] == 'string') ? 'all' : newValues.bins) + ' categories in the column of "' + newValues.targetColumn + '"';

    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      if (dataset.main.schema.fields.some(e => e.name === this.props.view.settings.targetColumn)) {
        data = dataset[id];
      }
      else{
        data["resetRequest"] = true;
      }
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------
