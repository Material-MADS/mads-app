/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'Custom' Chart View
// ------------------------------------------------------------------------------------------------
// Notes: 'Custom' is the manager of all current input that controls the final view of the
//         'CustomVS' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support,
//             Internal CustomVC & CustomForm libs,
=================================================================================================*/

//*** TODO: This is yet not implemented into the application and is still under construction

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import CustomVC from '../VisComponents/CustomVC';
import CustomForm from './CustomForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class CustomView extends withCommandInterface(CustomVC, CustomForm) {

  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    // if (values.filter) {
    //   const colorTagIds = colorTags.map((c) => c.id);
    //   const filteredFilters = values.filter.filter((f) =>
    //     colorTagIds.includes(f)
    //   );
    //   newValues.filter = filteredFilters;
    // }

    // extract data
    // let internalData = dataset.main.data;
    // if (values.colorAssignmentEnabled && newValues.mappings && newValues.mappings.color) {
    //   internalData = _.clone(dataset.main.data);
    //   internalData.sort(function(a, b) { return a[newValues.mappings.color] - b[newValues.mappings.color]; });
    // }
    // const df = new DataFrame(internalData);
    let data = {};

    // if(newValues.method == "PCA"){
    //   if (!newValues.featureColumns[0] || !newValues.targetColumn) {
    //     return;
    //   }

    //   if(!newValues.options){ newValues["options"] = { axisTitles: [] } }
    //   newValues.options.axisTitles = ['PC 1', 'PC 2', 'PC 3'];

    //   (dataset.main.data).forEach(obj => {
    //     Object.keys(obj).forEach(key => {
    //       data[key] = (data[key] || []).concat([obj[key]]);
    //     });
    //   });
    // }
    // else { //"Manual"
    //   if(newValues.method == undefined){
    //     newValues['method'] = 'Manual';
    //   }
    //   if (!newValues.options.axisTitles[0] || !newValues.options.axisTitles[1] || !newValues.options.axisTitles[2]) {
    //     return;
    //   }
    //   data = {x: (df.get(newValues.options.axisTitles[0])).values.toArray(), y: (df.get(newValues.options.axisTitles[1])).values.toArray(), z: (df.get(newValues.options.axisTitles[2])).values.toArray()};
    // }

    // if(newValues.method != undefined){
    //   if (values.colorAssignmentEnabled && newValues.mappings && newValues.mappings.color) {
    //     data["gr"] = (df.get(newValues.mappings.color)).values.toArray();
    //   }

    //   if (values.sizeAssignmentEnabled && newValues.mappings && newValues.mappings.size) {
    //     const sizeVals = (df.get(newValues.mappings.size)).values.toArray();
    //     const ratio = Math.max(...sizeVals) / 10;
    //     newValues.options.marker.size = sizeVals.map(v => Math.round(v / ratio)*2);
    //   }
    // }

    newValues = convertExtentValues(newValues);
    // actions.sendRequestViewUpdate(view, newValues, data);
    actions.sendRequestViewUpdate(view, newValues, data);
  };


  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      // const testColumn = this.props.view.settings.targetColumn || (this.props.view.settings.options?(this.props.view.settings.options.axisTitles?this.props.view.settings.options.axisTitles[0]:undefined):undefined)
      // if (dataset.main.schema.fields.some(e => e.name === testColumn)) {
      //   data = dataset[id];
      // }
      // else{
      //    data["resetRequest"] = true;
      // }
    }

    return data;
  };
}
//-------------------------------------------------------------------------------------------------
