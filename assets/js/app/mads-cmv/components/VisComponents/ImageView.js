/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'ImageView' module
// ------------------------------------------------------------------------------------------------
// Notes: 'ImageView' is a visualization component that displays any basic image file based on a
//        range of available properties.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party jquery, internal support methods fr. VisCompUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import $ from "jquery";

import { create_UUID } from './VisCompUtils';

import noImg from './images/noimage.jpg';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Empty Image View",
  caption: "No Image Loaded",
  extent: { width: undefined, height: undefined },
  pad: 0,
  border: {
    color: "black",
    style: "solid",
    size: 2,
  }
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Returns the previous value
//-------------------------------------------------------------------------------------------------
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function ImageView({
  data,
  mappings,
  options,
  colorTags,
}) {
  // Initiation of the VizComp
  const rootNode = useRef(null);
  const uid = create_UUID();
  let internalData = data;
  let internalOptions = Object.assign({}, defaultOptions, options);

  // Clear away all data if requested
  useEffect(() => {
    if(internalData.resetRequest){
      delete internalData.resetRequest;
    }
  }, [internalData])

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    $(rootNode.current).empty();

    let activeImgSrc = noImg;
    if(internalData.data){
      activeImgSrc = internalData.data;
    }

    $(rootNode.current).append(`
      <div>
        <figure>
          <label id="CadsWSUserImageTitle` + uid + `" style="font-weight: bold; font-size: 16px;"></label></br>
          <img id="CadsWSUserImage` + uid + `"
            src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
            style="
              margin-top: 5px;
              border: ` + (internalOptions.border.style || defaultOptions.border.style) + ` ` + (internalOptions.border.color || defaultOptions.border.color) + ` ` + (internalOptions.border.size || defaultOptions.border.size) + `px;
              padding: ` + internalOptions.pad + `px;
            "
            width="` + internalOptions.extent.width + `"
          />
          <figcaption id="CadsWSUserImageCaption` + uid + `"style="font-style: italic; font-size: 12px; font-weight: lighter; text-align: center;"></figcaption>
        </figure>
      </div>`
    );

    var thisImg = $(rootNode.current).find('#CadsWSUserImage' + uid).attr("src", activeImgSrc).on('load', function () {
      $(rootNode.current).find('#CadsWSUserImageTitle' + uid).text(internalOptions.title);
      $(rootNode.current).find('#CadsWSUserImageCaption' + uid).width(thisImg.width()).text(internalOptions.caption);
    });
  };

  // Clear away the VizComp
  const clearChart = () => { };

  // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
    return () => {
      clearChart();
    };
  }, [data, mappings, options, colorTags]);

  // Add the VizComp to the DOM
  return (
    <div>
      <div ref={rootNode} />
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
ImageView.propTypes = {
  data: PropTypes.shape({ }),
  mappings: PropTypes.shape({}),
  options: PropTypes.shape({
    title: PropTypes.string,
    caption: PropTypes.string,
    pad: PropTypes.number,
    border: PropTypes.shape({
      color: PropTypes.string,
      style: PropTypes.string,
      size: PropTypes.number,
    }),
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),
  }),
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
ImageView.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
};
//-------------------------------------------------------------------------------------------------
