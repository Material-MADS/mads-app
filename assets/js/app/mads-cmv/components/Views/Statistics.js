/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Statistics' View
// ------------------------------------------------------------------------------------------------
// Notes: 'Statistics' is the manager of all current input that controls the final view of the
//         'Statistics' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support,
//             Internal Table & TableForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';
import withCommandInterface from './ViewWrapper';
import StatisticsVis from '../VisComponents/StatisticsVis';
import StatisticsForm from './StatisticsForm';
import convertExtentValues from './FormUtils';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class StatisticsView extends withCommandInterface(StatisticsVis, StatisticsForm) {

  handleSubmit = (values) => {
    if(values.featureColumns.length == 0){ throw "No data to work with" }

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

    const data = {};
    const df = new DataFrame(dataset.main.data);
    newValues.featureColumns.forEach((c) => {
      const fc = df.get(c);
      data[c] = fc.values.toArray();
    });

    newValues = convertExtentValues(newValues);

    actions.sendRequestViewUpdate(view, newValues, data);
  };

  mapData = (dataset) => {
    const { id, view, options } = this.props;
    const data = {
      data: [],
      columns: [],
    };

    if (dataset[id]) {
      return dataset[id];
    }
    return data;
  };
}
//-------------------------------------------------------------------------------------------------
