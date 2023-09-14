/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
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
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import Bar from '../VisComponents/BarChart';
import BarForm from './BarForm';

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
export default class BarView extends withCommandInterface(Bar, BarForm) {

  // Manages config settings changes (passed by the connected form) in the view
  handleSubmit = (values) => {
    if(values.mappings.measures.length == 0){ throw "No data to work with" }

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
    var transposedData;
    if(newValues.options.transposeEnabled){
      var transposeSplitColumnValues = dataset.main.data.map(r => r[newValues.options.transposeSplitColumn].toString());
      transposedData = newValues.options.transposeGroup.map((tgm) => {return {[newValues.options.transposeGroupLabel]: tgm};} );

      for(var i = 0; i < transposeSplitColumnValues.length; i++){
        const theValueRow = dataset.main.data.filter(row => row[newValues.options.transposeSplitColumn] == transposeSplitColumnValues[i]);
        for(var k = 0; k < transposedData.length; k++){
          const theValue = theValueRow[0][newValues.options.transposeGroup[k]];
          transposedData[k][transposeSplitColumnValues[i]] = theValue;
        }
      }
    }

    var dataSource = (transposedData != undefined) ? transposedData : dataset.main.data
    var categorizedData;
    if(newValues.options.valCalcMethod){
      var filteredUniqueCategoriesOnly = [...new Set(dataSource.map(r => r[newValues.mappings.dimension].toString()))] ;
      categorizedData = filteredUniqueCategoriesOnly.map((uc) => {return {[newValues.mappings.dimension]: uc }; });
      for(var j = 0, cdr; cdr = categorizedData[j]; j++){
        const theCatRows = dataSource.filter(row => row[newValues.mappings.dimension] == cdr[newValues.mappings.dimension]);
        for(var i = 0, msrs; msrs = newValues.mappings.measures[i]; i++){
          switch (newValues.options.valCalcMethod) {
            case 'Total':
              var theSum = theCatRows.reduce(function (acc, obj) { return acc + obj[msrs]; }, 0);
              cdr[msrs] = theSum;
              break;
            case 'Mean':
              var theSum = theCatRows.reduce(function (acc, obj) { return acc + obj[msrs]; }, 0);
              cdr[msrs] = (theSum / theCatRows.length);
              break;
            case 'Median':
              cdr[msrs] = getMedian(theCatRows.map(o => o[msrs]));
              break;
            case 'Max':
              cdr[msrs] = (Math.max(...theCatRows.map(o => o[msrs])));
              break;
            case 'Min':
              cdr[msrs] = (Math.min(...theCatRows.map(o => o[msrs])));
              break;

            default:
              break;
          }
        }
      }
    }


    const data = {};
    const df = (categorizedData != undefined) ? new DataFrame(categorizedData) : new DataFrame(dataSource);
    const dimensions = df.get(newValues.mappings.dimension);
    const measures = df.get(newValues.mappings.measures);
    data[newValues.mappings.dimension] = dimensions.values.toArray();
    newValues.mappings.measures.forEach((c) => {
      const mc = df.get(c);
      data[c] = mc.values.toArray();
    });
    newValues = convertExtentValues(newValues);
    newValues['options']['title'] = 'The ' + ((categorizedData != undefined) ? newValues.options.valCalcMethod+" " : "") + 'values of [' + newValues.mappings.measures.map(c => `"${c}", `).join('') + '] for ' + ((categorizedData != undefined) ? "the categories of " : "") + '"' + newValues.mappings.dimension + '"';

    actions.sendRequestViewUpdate(view, newValues, data);
  };


  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      var testValue = this.props.view.settings.options.transposeEnabled ? this.props.view.settings.options.transposeGroup[0] : this.props.view.settings.mappings.measures[0]
      if (dataset.main.schema.fields.some(e => e.name === testValue)) {
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
