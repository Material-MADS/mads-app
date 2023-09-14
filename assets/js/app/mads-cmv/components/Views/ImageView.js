/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the 'ImageView' View
// ------------------------------------------------------------------------------------------------
// Notes: 'ImageView' is the manager of all current input that controls the final view of the
//         'ImageView' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support, Internal ImageView & ImageViewForm libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import ImageView from '../VisComponents/ImageView';
import ImageViewForm from './ImageViewForm';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The View Class for this Visualization Component
//-------------------------------------------------------------------------------------------------
export default class ImageViewView extends withCommandInterface(ImageView, ImageViewForm) {

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

    let data = {};
    newValues.options.border.size = isNaN(Number(newValues.options.border.size)) ? 0 : Number(newValues.options.border.size);
    newValues = convertExtentValues(newValues);
    for (const cf in newValues.options.cssFilters) {
      if(cf !== "isEnabled"){
        newValues.options.cssFilters[cf] = parseInt(newValues.options.cssFilters[cf]);
      }
    }

    if(newValues.options.skImg.isEnabled){
      const originData = (newValues.options.backupBlob && newValues.options.backupBlob !== "none") ? newValues.options.backupBlob : (newValues.options.imgData || "");
      const manipData = dataset[id] ? dataset[id].manipVer : "";
      data = {origin: originData, manipVer: manipData};
    }
    actions.sendRequestViewUpdate(view, newValues, data);
  };

  // Manages data changes in the view
  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      data = dataset[id];

      if (data.debugInfo) {
        console.log("SERVER SIDE DEBUG INFO:");
        console.log(data.debugInfo);
      }
    }
    return data;
  };
}
//-------------------------------------------------------------------------------------------------
