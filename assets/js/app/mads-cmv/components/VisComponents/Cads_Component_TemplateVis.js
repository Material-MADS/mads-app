/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the
//              'Cads_Component_Template' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Cads_Component_Template' is a component that makes amazing things.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party jquery, internal support methods fr. VisCompUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import './Cads_Component_TemplateVisStyles.css';

import $ from "jquery";

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Empty 'Cads_Component_Template' Component",
  extent: { width: undefined, height: undefined },
};

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Component Default and Intial Options / Settings
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function Cads_Component_Template({
  data,
  mappings,
  options,
  colorTags,
  originalOptions,
  id,
}) {
  // Initiation of the VizComp
  const rootNode = useRef(null);
  const uid = "id"+id;
  let internalOptions = {...defaultOptions, ...options};

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    $(rootNode.current).empty();

    $(rootNode.current).append(`
      <div class="compBody">
        <div className="main" id="outputContainer` + id + `" style="
          position: relative;
          border: solid black 1px;
          padding: 10px;
          font-weight: bold;
          font-size: 20px;
          width: ` + internalOptions.extent.width + `;
        ">
        </div>
        <div>Server Say: ` + data.content + `</div>
      </div>`
    );

    var outputContainer = $(rootNode.current).find("#outputContainer" + id);
    const whatChoice = internalOptions.something || "";

    if(whatChoice == 'Something'){
      const whatParameter = internalOptions.anotherThing;

      outputContainer.html(`
        <h1 class="compH1Style">Choice: ` + whatChoice + `</h1>
        <p>We are going to do something ` + whatParameter + ` times</p>
      `);
    }

    else if(whatChoice == 'Something Else'){
      const whatParameter = internalOptions.diff;

      outputContainer.html(`
        <h1 class="compH1Style">Choice: ` + whatChoice + `</h1>
        <p>We are going to do something else, that is related to ` + whatParameter + `</p>
      `);
    }

    else{
      outputContainer.html(`
        <h1 class="compH1Style">Choice: None</h1>
        <p>We are going to do nothing (right now)</p>
      `);
    }
  };

   // Clear away the VizComp
   const clearChart = () => {
    /* Called when component is deleted */
  };

  // Only called at init and set our final exit function
  useEffect(() => {
    return () => { clearChart(); };
  }, []);

  // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
  }, [data, options]);

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
Cads_Component_Template.propTypes = {
  data: PropTypes.shape({ }),
  options: PropTypes.shape({
    something: PropTypes.string,
    anotherThing: PropTypes.number,
    diff: PropTypes.string,
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
Cads_Component_Template.defaultProps = {
  data: {},
  options: defaultOptions,
  colorTags: [],
};
//-------------------------------------------------------------------------------------------------
