import React, { useState, useEffect, useRef } from "react";
import { useSelector } from 'react-redux'
import PropTypes from "prop-types";
import $ from "jquery";

import { create_UUID } from './VisCompUtils';

import * as Bokeh from "@bokeh/bokehjs";

import noImg from './images/noimage.jpg';

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";

// Dev and Debug declarations
window.Bokeh = Bokeh;


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


function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
export default function ImageView({
  data,
  mappings,
  options,
  colorTags,
}) {
  const rootNode = useRef(null);
  const uid = create_UUID();
  let internalData = data;
  let internalOptions = Object.assign({}, defaultOptions, options);

  useEffect(() => {
    if(internalData.resetRequest){
      // internalOptions.title = "Scatter 3D";
      // internalOptions.axisTitles = ['x', 'y', 'z'];
      delete internalData.resetRequest;
    }
  }, [internalData])

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

  const clearChart = () => { };

  useEffect(() => {
    createChart();
    return () => {
      clearChart();
    };
  }, [data, mappings, options, colorTags]);

  return (
    <div id="container">
      <div ref={rootNode} />
    </div>
  );
}

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

ImageView.defaultProps = {
  data: "",
  mappings: {},
  options: defaultOptions,
  colorTags: [],
};
