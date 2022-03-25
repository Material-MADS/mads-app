/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'HeatMap' View
// ------------------------------------------------------------------------------------------------
// Notes: 'HeatMap' is the manager of all current input that controls the final view of the
//         'HeatMap' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas & lodash libs, Internal ViewWrapper & Form Utility Support,
//             Internal HeatMap & HeatMapForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';
import _ from 'lodash';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import HeatMap from '../VisComponents/HeatMap';
import HeatMapForm from './HeatMapForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
class HeatMapView extends withCommandInterface(HeatMap, HeatMapForm) {

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

    // extract data
    const df = new DataFrame(dataset.main.data);
    const xData = (df.get(newValues.xData).values.toArray()).map(v => (v + ''));
    const yData = (df.get(newValues.yData).values.toArray()).map(v => (v + ''));
    const heatVal = (df.get(newValues.heatVal).values.toArray()).map(v => (parseFloat(v)));
    const data = { xData, yData, heatVal };

    let xRange = [];
    if(isNaN(xData[0])){
      xRange = (xData.filter((v, i, a) => a.indexOf(v) === i)).sort();
    }
    else{
      xRange = (xData.filter((v, i, a) => a.indexOf(v) === i)).sort((a,b) => parseInt(a)-parseInt(b));
      if(parseInt(xRange[1]) > parseInt(xRange[xRange.length - 1])){
        xRange.reverse();
      }
    }

    let yRange = [];
    if(isNaN(yData[0])){
      yRange = (yData.filter((v, i, a) => a.indexOf(v) === i)).sort();
    }
    else{
      yRange = (yData.filter((v, i, a) => a.indexOf(v) === i)).sort((a,b) => parseInt(a)-parseInt(b));
      if(parseInt(yRange[1]) < parseInt(yRange[yRange.length - 1])){
        yRange.reverse();
      }
    }

    newValues['options']['x_range'] = xRange;
    newValues['options']['y_range'] = yRange;
    newValues['options']['toolTipTitles'] = [newValues.xData, newValues.yData, newValues.heatVal];
    newValues['options']['title'] = 'Heat map for ' + newValues.heatVal + ' for each cross section of a specific ' + newValues.xData + ' and ' + newValues.yData;

    newValues = convertExtentValues(newValues);

    // updateView(id, newValues);
    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      const testColumn = this.props.view.settings.xData;
      if (dataset.main.schema.fields.some(e => e.name === testColumn)) {
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

export default HeatMapView;
