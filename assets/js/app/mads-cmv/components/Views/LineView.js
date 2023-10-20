/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Line' Chart View
// ------------------------------------------------------------------------------------------------
// Notes: 'Line' is the manager of all current input that controls the final view of the
//         'LineChart' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas libs, Internal ViewWrapper & Form Utility Support,
//             Internal LineChart & LineForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import Line from '../VisComponents/LineChartVis';
import LineForm from './LineForm';

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// Support Methods and Variables
//-------------------------------------------------------------------------------------------------

//====================
// Get Median
//-------------------------------------------------------------------------------------------------
const getMedian = function(arr) {
  const mid = Math.floor(arr.length / 2), nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class LineView extends withCommandInterface(Line, LineForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    if(values.mappings.xData.length == 0){ throw "No data to work with" }

    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    var dataSource = dataset.main.data;
    let newValues = { ...values };
    const data = {};
    newValues.options.axisLabels = ['', ''];

    const df = new DataFrame(dataSource);
    const xData = df.get(newValues.mappings.xData);
    data[newValues.mappings.xData] = xData.values.toArray();

    newValues.mappings.yData.forEach(xt => {
      const yData = (df.get(xt)).values.toArray();
      data[xt] = yData;
    });

    if(newValues.options.legendLabel == ""){
      if(newValues.mappings.yData.length > 1){
        newValues.options.legendLabel = [];
        for(var i = 0; i < newValues.mappings.yData.length; i++ ){
          newValues.options.legendLabel.push(newValues.mappings.yData[i]);
        }
      }
      else{
        newValues.options.legendLabel = newValues.mappings.yData[0];
      }
    }
    if(newValues.options.XAxisLabel == ""){ newValues.options.axisLabels[0] = newValues.mappings.xData; } else { newValues.options.axisLabels[0] = newValues.options.XAxisLabel }
    if(newValues.options.YAxisLabel == ""){ newValues.options.axisLabels[1] = Array.isArray(newValues.options.legendLabel) ? newValues.options.legendLabel[0] : newValues.options.legendLabel; } else { newValues.options.axisLabels[1] = newValues.options.YAxisLabel }
    if(!newValues.options.title || newValues.options.title == ""){
      newValues.options.title = newValues.options.axisLabels[1] + ' for each ' + newValues.options.axisLabels[0];
      if(newValues.mappings.yData.length > 1){ newValues.options.title += ' per ' + newValues.options.legendLabel; }
    }

    if(newValues.options.lineStylesEnabled){ newValues.options['lineDash'] = ["solid", "dashed", "dotted", "dotdash", "dashdot"]; }
    else{ newValues.options['lineDash'] = undefined }

    newValues = convertExtentValues(newValues);
    newValues.data = data;
    updateView(id, newValues);
  };


  // Manages data changes in the view
  mapData = (dataset) => {
    let data = {};

    var dataFields = this.props.dataset.main.schema ? this.props.dataset.main.schema.fields.map(a => a.name) : [];
    var currUsedField = this.props.view.settings.mappings.xData;

    if (dataFields.length > 0 && currUsedField != undefined && !dataFields.some(e => e === currUsedField)) {
      if(this.props.view.settings){
        this.props.view.settings.data = {};
        this.props.view.settings.options = {};
      }
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------
