// IMPORT SECTION
//===================================================================================================================
// Main Dependent libraries (React and related)
//---------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

// Available Visual Components to be used with this customizable one
//------------------------------------------------------------------
import BarChart from "./BarChart";
import ClassificationVis from "./ClassificationVis";
import HeatMap from "./HeatMap";
import ImageView from "./ImageView";
import Molecule3D from './Molecule3D';
import PeriodicTableChart from "./PeriodicTableChart";
import PieChart from "./PieChart";
import QuadBarChart from "./QuadBarChart";
import RegressionVis from "./RegressionVis";
import Scatter from "./Scatter";
import Scatter3D from './Scatter3D';


// CONSTANTS AND VARIABLES
//===================================================================================================================

//----------------------------------------------------------------------------------
// CONSTANT VARIABLE: defaultOptions
// object that contains all default settings for this visual component
//----------------------------------------------------------------------------------
const defaultOptions = {
  title: "Custom Visual Component",           // Displayed Name/Title of the component
  extent: { width: 400, height: 400 },        // Size (Width & Height) of the component
  visComp: undefined,                         // Which Visual Component to use for displaying data
};
//----------------------------------------------------------------------------------


//----------------------------------------------------------------------------------
// CONSTANT VARIABLE: availableComponents
// object that contains all available Visual Coponents this custom component can display
//----------------------------------------------------------------------------------
const availableComponents = {
  BarChart: BarChart,
  ClassificationVis: ClassificationVis,
  HeatMap: HeatMap,
  ImageView: ImageView,
  Molecule3D: Molecule3D,
  PeriodicTableChart: PeriodicTableChart,
  PieChart: PieChart,
  QuadBarChart: QuadBarChart,
  RegressionVis: RegressionVis,
  Scatter: Scatter,
  Scatter3D: Scatter3D,
};
//----------------------------------------------------------------------------------

//===================================================================================================================



// MAIN CLASS OBJECT
//===================================================================================================================

//----------------------------------------------------------------------------------
// CLASS: CustomVC
// The main Visual Component, that is of custom type, meaning that it can be set and
// configured into any of the exisiting stand alone visual components and more.
//----------------------------------------------------------------------------------
export default function CustomVC({ data, mappings, options, colorTags, selectedIndices, onSelectedIndicesChange,}) {
  // Init component
  const rootNode = useRef(null);
  const internalOptions = Object.assign({}, defaultOptions, options);

  //Reset Visual Component if requested the data parameter
  useEffect(() => {
    if(data && data.resetRequest){
      internalOptions.title = "EMPTY CUSTOM COMPONENT";
      delete data.resetRequest;
    }
  }, [data]);

  // Creates an empty Custom Visual Component
  function emptyCustomVC() {
    return <div><label style={{fontWeight: 'bold', fontSize: '16px'}}>{internalOptions.title}</label><br/><div style={{border: 'solid black 3px', backgroundColor: 'yellow', backgroundImage: 'linear-gradient(to right, Red , Orange, Yellow, Green, Blue, Indigo, Violet)', width: internalOptions.extent.width, height: internalOptions.extent.height}} /></div>
  }

  // Set current selected Visual Component
  const SelComp = (internalOptions.VisComp && availableComponents[internalOptions.VisComp]) ? availableComponents[internalOptions.VisComp] : emptyCustomVC;
  let params = { data, mappings, options, colorTags, selectedIndices, onSelectedIndicesChange,};

  // Return the visual component
  return (
    <div id="containerHolder">
      <div ref={rootNode} />
      <SelComp {...params} />
    </div>
  );
};

//----------------------------------------------------------------------------------
// OPJECT DEFINES: propTypes
// Defining the types for various properties this Visual Component should manage
// and recieve.
//----------------------------------------------------------------------------------
CustomVC.propTypes = {
  options: PropTypes.shape({
    title: PropTypes.string,
    VisComp: PropTypes.string,
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),
  }),
};
//----------------------------------------------------------------------------------

//----------------------------------------------------------------------------------
// OPJECT DEFINES: defaultProps
// Defining the default initial values for the various parameters this Visual
// Component should use.
//----------------------------------------------------------------------------------
CustomVC.defaultProps = {
  options: defaultOptions,
};
//----------------------------------------------------------------------------------

//===================================================================================================================
