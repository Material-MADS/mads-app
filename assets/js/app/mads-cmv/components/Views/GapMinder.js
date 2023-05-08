/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'GapMinder' Plot View
// ------------------------------------------------------------------------------------------------
// Notes: 'GapMinder' is the manager of all current input that controls the final view of the
//         'GapMinder' visualization component.
// ------------------------------------------------------------------------------------------------
// References: 3rd party pandas & lodash libs, Internal ViewWrapper & Form Utility Support,
//             Internal GapMinder & GapMinderForm libs,
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';
import _ from 'lodash';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import GapMinder from '../VisComponents/GapMinder';
import GapMinderForm from './GapMinderForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class GapMinderView extends withCommandInterface(GapMinder, GapMinderForm) {

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
    let internalData = dataset.main.data;
    if (values.colorAssignmentEnabled && newValues.mappings && newValues.mappings.color) {
      internalData = _.clone(dataset.main.data);
      internalData.sort(function(a, b) { return a[newValues.mappings.color] - b[newValues.mappings.color]; });
    }
    const df = new DataFrame(internalData);
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
    //     newValues.options.marker['manySizes'] = sizeVals.map(v => Math.round(v / ratio)*2);
    //   }
    //   else{ newValues.options.marker['manySizes'] = []; }
    // }

    newValues = convertExtentValues(newValues);
    // actions.sendRequestViewUpdate(view, newValues, data);
    updateView(id, newValues);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      const testColumn = this.props.view.settings.targetColumn || (this.props.view.settings.options?(this.props.view.settings.options.axisTitles?this.props.view.settings.options.axisTitles[0]:undefined):undefined)
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
