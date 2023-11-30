/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Hist' Chart View
// ------------------------------------------------------------------------------------------------
// Notes: 'Hist' is the Histogram manager of all current input that controls the final view of the
//         this specific case of a 'QuadBarChart' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas libs, Internal ViewWrapper & Form Utility Support,
//             Internal QuadBarChart & HistForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import QuadBarChart from '../VisComponents/QuadBarChartVis';
import HistForm from './HistForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Custom Settings to pass to the VisComp
//-------------------------------------------------------------------------------------------------
const settings = {
  options: { title: 'Histogram' },
};

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class HistView extends withCommandInterface(QuadBarChart, HistForm, settings) {

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

    if (!newValues.targetColumns[0] || !newValues.bins) {
      return;
    }

    // extract data
    const data = {};
    const df = new DataFrame(dataset.main.data);
    newValues.targetColumns.forEach((c) => {
      const tc = df.get(c);
      data[c] = tc.values.toArray();
    });

    newValues = convertExtentValues(newValues);

    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      if (dataset.main.schema.fields.some(e => e.name === this.props.view.settings.targetColumns[0])) {
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
