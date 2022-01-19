/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Bar' Chart View
// ------------------------------------------------------------------------------------------------
// Notes: 'Bar' is the manager of all current input that controls the final view of the
//         'BarChart' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas libs, Internal ViewWrapper & Form Utility Support,
//             Internal BarChart & BarForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { Series, DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import Bar from '../VisComponents/BarChart';
import BarForm from './BarForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class BarView extends withCommandInterface(Bar, BarForm) {

  // Manages data selection changes in the view
  handleSelectionChange = (indices) => {
    const { dataset, updateSelection } = this.props;
    const data = this.mapData(dataset);

    let selections = [];
    indices.forEach((i) => {
      const idx = data.indices[i];
      selections = [...selections, ...idx];
    });
    updateSelection(selections);
  };

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

    if (newValues.mappings.dimension == undefined || newValues.mappings.measures == undefined) {
      return;
    }

    // extract data
    const df = new DataFrame(dataset.main.data);
    const s1 = df.get(newValues.mappings.dimension);
    const s2 = df.get(newValues.mappings.measures);
    const data = {};
    data[newValues.mappings.dimension] = s1.values.toArray();
    data[newValues.mappings.measures] = s2.values.toArray();

    newValues = convertExtentValues(newValues);
    newValues['options']['title'] = 'The value of "' + newValues.mappings.measures + '" for each "' + newValues.mappings.dimension + '"';
    newValues.mappings.measures = [newValues.mappings.measures];

    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      if (dataset.main.schema.fields.some(e => e.name === this.props.view.settings.mappings.dimension)) {
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
