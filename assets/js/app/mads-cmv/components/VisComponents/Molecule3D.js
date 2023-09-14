/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'Molecule3D' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Molecule3D' is a visualization component that displays an interactive 3D molecule in
//        numerous ways based on a range of available properties, and is rendered with the help of the
//        Chem-Doodle library.
// ------------------------------------------------------------------------------------------------
// References: React, redux & prop-types Libs, 3rd party jquery, lodash libs,
//             and also internal support methods from VisCompUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useEffect, useRef } from "react";
import { useSelector } from 'react-redux'
import PropTypes from "prop-types";

import _ from 'lodash';
import $ from "jquery";
import '@vendors/chem-doodle/ChemDoodleWeb.css';
import ChemDoodle from "@vendors/chem-doodle/ChemDoodleWeb";

import { getStandarizedColor, getRGBAColorStrFromAnyColor, create_UUID } from './VisCompUtils';

import iconImg from './images/webLinkIcon.png';
import scanIconImg from './images/scanLogo.png';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Internal Constants
//-------------------------------------------------------------------------------------------------
const molDrawTypes = [
  "Ball and Stick",
  "Stick",
  "van der Waals Spheres",
  "Wireframe",
  "Line"
];

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Empty 3D Molecule",
  extent: { width: 500, height: 400 },
  molDrawType: molDrawTypes[0],
  bkgCol: "#ffffff",
  txtCol: "black",
  border: "1px solid black",
  bkgGradientEnabled: false,
  bkgGradientCols: ["white", "red", "orange", "yellow"],
  customAtomColorsEnabled: false,
  customAtomCols: [["C", "purple"], ["H", "green"], ["O", "orange"]],
  customBondsEnabled: false,
  customBondsColAndSize: ["gray", "0.3"],
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
export default function Molecule3D({
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

  let currentDataSourceName = "";
  try {
    const availableDataSources = useSelector((state) => state.dataSources);
    currentDataSourceName = (availableDataSources.items.find(item => availableDataSources.selectedDataSource == item.id)).name;
  } catch (error) { /*Just ignore and move on*/ }

  // Clear away all data if requested
  useEffect(() => {
    if(internalData.resetRequest){
      $(rootNode.current).empty();
    }
  }, [internalData])

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    $(rootNode.current).empty();

    // Creating the container with a Canvas and a overlays
    var molViewer3dCanvas = document.createElement("canvas");
    const mv3dc_id = "molViewer3dCanvas-" + uid;
    molViewer3dCanvas.id = mv3dc_id;
    molViewer3dCanvas.class = "ChemDoodleWebComponent";
    var containerDiv = $(rootNode.current).append("<div class='cd-container'></div>");
    var overlayDiv = containerDiv.append(`
      <div class='cd-overlay' style='width: ` + (parseInt(internalOptions.extent.width)-20) + `px;'>
        <a name='cd-overlayLink0' href='#' target='_blank' style="float: left;"><img name='cd-overlayImg0' src='` + scanIconImg + `' width='30px' style='display: none;' /></a>
        <span name='cd-overlayTxt1'>` + internalOptions.title + `</span>
        </br>
        <span name='cd-overlayTxt2' style='font-size: 14px;'></span>
        <a name='cd-overlayLink1' href='#' target='_blank' style="float: right;"><img name='cd-overlayImg1' src='` + iconImg + `' width='30px' style='display: none;' /></a>
        </br>
        <span name='cd-overlayTxt3' style='font-size: 11px; font-weight: normal;'></span>
      </div>
    `);
    containerDiv.append(molViewer3dCanvas);
    var instructions = containerDiv.append(`
      <div name='instCont' style='width: ` + (parseInt(internalOptions.extent.width)-20) + `px; text-align: left; margin-top: -2px; line-height: 1.0; cursor: pointer;'>
        <span name='molViewInstrHdr' style='font-size: 14px; font-weight: bold;'>
          Click to show Full Instructions:</br>
        </span>
        <span name='molViewInstr' style='font-size: 10px; font-weight: normal; display: none;'>
          Double click to toggle overlay visibilty. Use Numbers 1-5 for 3D types.
          </br>Press 'c' to toggle compass visibility. Press 'l'[L] to toggle Atom Labels visibility.
          </br>Press NumPad 1, 2 or 3 for Atom Labels size. Press 'x' to generate image in new tab.
          </br>Press Left or Right Arrow key to circulate selected Atom. Press 'p' to lock selection. Esc to reset.
        </span>
      </div>
    `);

    // Creating the Chem Doodle WebGl Element
    let molViewer3d = new ChemDoodle.TransformCanvas3D(mv3dc_id, internalOptions.extent.width, internalOptions.extent.height);

    // Prep undefined molecule
    let molecule;

    // Prep atom selection
    let selectedAtom = -1;
    let lockedAtoms = [];

    let resetSelection = function(){
      if(molecule){
        if(selectedAtom != -1){
          let selOldAtomStyle = molViewer3d.styles.copy();
          selOldAtomStyle.atoms_useJMOLColors = true;
          selOldAtomStyle.atoms_color = undefined;
          selOldAtomStyle.atoms_vdwMultiplier_3D = 0.3;
          molecule.atoms[selectedAtom].styles = selOldAtomStyle;
          for(var i = 0; i < lockedAtoms.length; i++){
            molecule.atoms[lockedAtoms[i]].styles = selOldAtomStyle;
          }
        }
        selectedAtom = -1;
        lockedAtoms = [];
        overlayDiv.find("[name='cd-overlayTxt3']").html('This molecule contains ' + molecule.atoms.length + ' atoms and ' + molecule.bonds.length + ' bonds.');
      }
    }

    // adding events to the overlay Elements
    instructions.find("[name='instCont']").on( "click", function() {
      var mvi = instructions.find("[name='molViewInstr']");
      if(mvi.is(":visible")){ instructions.find("[name='molViewInstr']").hide(); }
      else{ instructions.find("[name='molViewInstr']").show(); }
    });

    // adding events to the Chem Doodle Element
    molViewer3d.dblclick = function(e){ overlayDiv.find(".cd-overlay").toggle(); }
    molViewer3d.keydown = function(e){
      if(e.keyCode == 67){ //Press C for Compass
        molViewer3d.styles.compass_display = !molViewer3d.styles.compass_display;
      }
      else if(e.keyCode >= 49 && e.keyCode <= 53){ //Press 1-5 for 3D Type
        molViewer3d.styles.set3DRepresentation(molDrawTypes[e.keyCode-49]);
      }
      else if(e.keyCode == 76){ //Press L for labels
        molViewer3d.styles.atoms_displayLabels_3D = !molViewer3d.styles.atoms_displayLabels_3D;
      }
      else if(e.keyCode >= 97 && e.keyCode <= 99){ //Press Num 1-3 for label size
        molViewer3d.styles.text_font_size = parseInt(12 * (e.keyCode-96));
        if(molecule){molViewer3d.loadMolecule(molecule);}
      }
      else if(e.keyCode == 88){ //Press X for generate image
        molViewer3d.repaint();
        var molimg = ChemDoodle.io.png.string(molViewer3d);
        var win = window.open();
        win.document.write('<iframe src="' + molimg  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
      }
      else if(e.keyCode == 39 || e.keyCode == 37){ //Press Left or Right arrow for circulate selected atom
        if(molecule){
          if(selectedAtom != -1 && !lockedAtoms.find(item => item === selectedAtom)){
            let selOldAtomStyle = molViewer3d.styles.copy();
            selOldAtomStyle.atoms_useJMOLColors = true;
            selOldAtomStyle.atoms_color = undefined;
            selOldAtomStyle.atoms_vdwMultiplier_3D = 0.3;
            molecule.atoms[selectedAtom].styles = selOldAtomStyle;
          }
          selectedAtom += parseInt((e.keyCode-38));
          if(selectedAtom >= molecule.atoms.length){ selectedAtom = 0 }
          if(selectedAtom < 0){ selectedAtom = (molecule.atoms.length - 1) }
          let selAtomStyle = molViewer3d.styles.copy();
          selAtomStyle.atoms_useJMOLColors = false;
          selAtomStyle.atoms_color = "#39ff14";
          selAtomStyle.atoms_vdwMultiplier_3D = 0.6;
          molecule.atoms[selectedAtom].styles = selAtomStyle;
          var selAtomInfo = ChemDoodle.ELEMENT[molecule.atoms[selectedAtom].label];
          overlayDiv.find("[name='cd-overlayTxt3']").html('This molecule contains ' + molecule.atoms.length + ' atoms and ' + molecule.bonds.length + ' bonds. </br><span style="font-weight: bold;">[Selected: ' + selAtomInfo.symbol + ' - ' + selAtomInfo.name + ' (Z: ' + selAtomInfo.atomicNumber + ', amu: ' + selAtomInfo.mass + 'u)]</span>');
        }
      }
      else if(e.keyCode == 27 || e.keyCode == 37){ //Press Esc to reset selected atom
        resetSelection();
      }
      else if(e.keyCode == 80 && selectedAtom != -1){ //Press P to lock selected atom
        if(molecule){
          lockedAtoms.push(selectedAtom);
          let selLockedAtomStyle = molViewer3d.styles.copy();
          selLockedAtomStyle.atoms_useJMOLColors = false;
          selLockedAtomStyle.atoms_vdwMultiplier_3D = 0.7;
          selLockedAtomStyle.atoms_color = "#ffa500";
          molecule.atoms[selectedAtom].styles = selLockedAtomStyle;

          if(lockedAtoms.length == 2){
            let distance = new ChemDoodle.structures.d3.Distance(molecule.atoms[lockedAtoms[0]], molecule.atoms[lockedAtoms[1]]);
            // let angle = new ChemDoodle.structures.d3.Angle(molecule.atoms[lockedAtoms[0]], molecule.atoms[lockedAtoms[1]], molecule.atoms[lockedAtoms[2]]);
            molViewer3d.loadContent([molecule], [distance]);
            resetSelection();
          }
        }
      }
      molViewer3d.repaint();
    }

    // If data exist
    if(internalData){
      // Read and create the molecule from the data
      try {
        if(internalData.fileExt == "mol"){
          molecule = ChemDoodle.readMOL(internalData.data, 1);
        }
        else if(internalData.fileExt == "cif"){
          molecule = ChemDoodle.readCIF(internalData.data).molecule;
        }
        else if(internalData.fileExt == "xyz"){
          molecule = ChemDoodle.readXYZ(internalData.data, 1);
        }
        else if(internalData.fileExt == undefined || internalData.fileExt == ""){
          // Do nothing
        }
        else{
          throw new Exception("Wrong Filetype");
        }
      } catch (error) {
        internalData.name = "MOL DATA ERROR";
        internalOptions.bkgCol = defaultOptions.bkgCol;
        internalOptions.txtCol = defaultOptions.txtCol;
        internalData.formula = "";
        internalData.url = "";
        overlayDiv.find("[name='cd-overlayTxt3']").text('This is not a proper molecule.');
        console.error("Something is wrong in the MOL string and cannot be read properly");
      }

      if(!internalData.name && (internalData.fileExt == "xyz" || internalData.fileExt == "cif") ){
        internalData.name = internalData.fileExt + " molecule";
      }

      // Setup overlay info text based on data
      if(internalData.name){overlayDiv.find("[name='cd-overlayTxt1']").text(internalData.name); }
      if(internalData.smiles){
        const scanLink = "https://scan.sci.hokudai.ac.jp/map-search?q=" + internalData.smiles + "&search-target=smiles&sort=id&order=asc&page=1";
        overlayDiv.find("[name='cd-overlayLink0']").attr("href", scanLink); overlayDiv.find("[name='cd-overlayImg0']").show();
      }
      if(internalData.formula){ overlayDiv.find("[name='cd-overlayTxt2']").html(internalData.formula.replace(/(\d+)/g, '<sub>$1</sub>')); }
      if(internalData.url){ overlayDiv.find("[name='cd-overlayLink1']").attr("href", internalData.url); overlayDiv.find("[name='cd-overlayImg1']").show(); }
      if(molecule && molecule.atoms){
        overlayDiv.find("[name='cd-overlayTxt3']").text('This molecule contains ' + molecule.atoms.length + ' atoms and ' + molecule.bonds.length + ' bonds.');
      }

      // Config the mol viewer according to preset options
      molViewer3d.styles.backgroundColor = internalOptions.bkgCol;
      $(molViewer3dCanvas).css('background', ('linear-gradient(90deg, ' + getRGBAColorStrFromAnyColor(internalOptions.bkgGradientCols[0]) + ' 0%, ' + getRGBAColorStrFromAnyColor(internalOptions.bkgGradientCols[0]) + ' 100%)'));

      if(getStandarizedColor(internalOptions.bkgCol) == getStandarizedColor(internalOptions.txtCol)){
        if(getStandarizedColor(internalOptions.bkgCol) == getStandarizedColor("black")){ internalOptions.txtCol = "white"; }
        else{ internalOptions.txtCol = "black"; }
      }
      overlayDiv.find(".cd-overlay").css("color", internalOptions.txtCol);
      molViewer3d.styles.set3DRepresentation(internalOptions.molDrawType);
      $(molViewer3dCanvas).css('border', internalOptions.border);

      if(internalOptions.bkgGradientEnabled){
        molViewer3d.styles.backgroundColor = undefined;
        var colStr = "";
        var step = 100/(internalOptions.bkgGradientCols.length-1);
        for(var i = 0; i < internalOptions.bkgGradientCols.length; i++){
          colStr += (getRGBAColorStrFromAnyColor(internalOptions.bkgGradientCols[i]) + " " + Math.round(step*i) + (i==(internalOptions.bkgGradientCols.length-1)?"%":"%, "));
        }
        $(molViewer3dCanvas).css('background', ('linear-gradient(135deg, ' + colStr + ')'));
      }

      if(internalOptions.customAtomColorsEnabled && (molecule && molecule.atoms)){
        for(var i = 0; i < internalOptions.customAtomCols.length; i++){
          let atomStyle = molViewer3d.styles.copy();
          atomStyle.atoms_useJMOLColors = false;
          atomStyle.atoms_color = internalOptions.customAtomCols[i][1];
          for(let j = 0; j < molecule.atoms.length; j++){
            let a = molecule.atoms[j];
            if(a.label.toLowerCase() === internalOptions.customAtomCols[i][0].toLowerCase()){
              a.styles = atomStyle;
            }
          }
        }
      }

      if(internalOptions.customBondsEnabled){
        molViewer3d.styles.bonds_color = internalOptions.customBondsColAndSize[0];
        molViewer3d.styles.bonds_cylinderDiameter_3D = internalOptions.customBondsColAndSize[1];
      }

      molViewer3d.styles.text_font_size = 24;

      // UNMANAGED CHEMDOODLE CONFIGS
      // -------------------------------------------------------------
      // molViewer3d.styles.text_font_families = ['Times New Roman'];
      // molViewer3d.styles.text_font_bold = true;
      // molViewer3d.styles.text_font_italic = true;
      // ===
      // molViewer3d.styles.lightDirection_3D = [1,1,1];
      // molViewer3d.styles.lightDiffuseColor_3D = "#ff0000";
      // ===
      // molViewer3d.styles.fog_mode_3D = 1;
      // molViewer3d.styles.fog_color_3D = '#ffffff';
      // molViewer3d.styles.fog_start_3D = 0.2;
      // molViewer3d.styles.fog_end_3D = 0.8;
      // ===
      // molViewer3d.styles.shadow_3D = true;
      // molViewer3d.styles.shadow_intensity_3D = 0.4;
      // ===
      // molViewer3d.styles.flat_color_3D = true;
      // molViewer3d.styles.antialias_3D = false;
      // molViewer3d.styles.gammaCorrection_3D = 10;
      // ===
      // molViewer3d.styles.outline_3D = true;
      // molViewer3d.styles.outline_thickness = 3;
      // molViewer3d.styles.outline_normal_threshold = 0.95;
      // molViewer3d.styles.outline_depth_threshold = 0.7
      // ===
      // molViewer3d.styles.atoms_display = false;
      // molViewer3d.styles.atoms_vdwMultiplier_3D = 1;
      // molViewer3d.styles.atoms_materialAmbientColor_3D = "#ff0000";
      // molViewer3d.styles.atoms_materialSpecularColor_3D = "0000ff";
      // ===
      // molViewer3d.styles.bonds_display = false;
      // molViewer3d.styles.bonds_splitColor = true;
      // molViewer3d.styles.bonds_colorGradient = true;
      // molViewer3d.styles.bonds_renderAsLines_3D = true;
      // molViewer3d.styles.bonds_materialAmbientColor_3D = "#ff0000";
      // molViewer3d.styles.bonds_materialSpecularColor_3D = "0000ff";
      // ===
      // molViewer3d.styles.proteins_displayRibbon = false;
      // molViewer3d.styles.proteins_displayBackbone = true;
      // molViewer3d.styles.proteins_displayPipePlank = true;
      // molViewer3d.styles.proteins_backboneThickness = 3;
      // molViewer3d.styles.proteins_backboneColor = "#ff0000";
      // molViewer3d.styles.proteins_ribbonCartoonize = true;
      // molViewer3d.styles.proteins_residueColor = "amino" //[none, amino, shapely, polarity - color amino acids by polar(red)/non-polar(white), acidity - color amino acids by acidic(red)/basic(blue)/neutral polar(white)/neutral non-polar(brown), rainbow]
      // molViewer3d.styles.proteins_primaryColor = "#ff00ff";
      // molViewer3d.styles.proteins_secondaryColor = "#0000ff";
      // molViewer3d.styles.proteins_ribbonCartoonHelixPrimaryColor = "#ffff00";
      // molViewer3d.styles.proteins_ribbonCartoonHelixSecondaryColor = "#00ffff";
      // molViewer3d.styles.proteins_ribbonCartoonSheetColor = "#f0f0f0";
      // molViewer3d.styles.proteins_tubeColor = "#ff0000";
      // molViewer3d.styles.proteins_tubeResolution_3D = 30;
      // molViewer3d.styles.proteins_ribbonThickness = 0.6;
      // molViewer3d.styles.proteins_tubeThickness = 0.9;
      // molViewer3d.styles.proteins_plankSheetWidth = 7;
      // molViewer3d.styles.proteins_cylinderHelixDiameter = 12;
      // molViewer3d.styles.proteins_verticalResolution = 16;
      // molViewer3d.styles.proteins_horizontalResolution = 16;
      // molViewer3d.styles.proteins_materialAmbientColor_3D = "#ff0000";
      // molViewer3d.styles.proteins_materialSpecularColor_3D = "#0000ff";
      // molViewer3d.styles.proteins_materialShininess_3D = 5;
      // ===
      // molViewer3d.styles.nucleics_display = false;
      // molViewer3d.styles.nucleics_tubeColor = "#ff0000";
      // molViewer3d.styles.nucleics_baseColor = "#ff0000";
      // molViewer3d.styles.nucleics_residueColor = "rainbow"; //[none, shapely, rainbow]
      // molViewer3d.styles.nucleics_tubeThickness = 3;
      // molViewer3d.styles.nucleics_tubeResolution_3D = 60;
      // molViewer3d.styles.nucleics_verticalResolution = 16;
      // molViewer3d.styles.nucleics_materialAmbientColor_3D = "#ff0000";
      // molViewer3d.styles.nucleics_materialSpecularColor_3D = "#0000ff";
      // molViewer3d.styles.nucleics_materialShininess_3D = 5;
      // ===
      // molViewer3d.styles.macro_displayAtoms = true;
      // molViewer3d.styles.macro_displayBonds = true;
      // molViewer3d.styles.macro_atomToLigandDistance = 2;
      // molViewer3d.styles.macro_showWater = true;
      // molViewer3d.styles.macro_colorByChain = true;
      // molViewer3d.styles.macro_rainbowColors = [#0000FF, #00FFFF, #00FF00, #FFFF00, #FF0000];
      // -------------------------------------------------------------

      // Finalize by rendering the configured molecule
      if(molecule){
        molViewer3d.loadMolecule(molecule);
      }

      // Make Sure focus is moved to the Molecule Viewer so that all keydown events work as intended
      $(molViewer3dCanvas).attr("tabindex", "0").on("mousedown" , function(){ $(this).trigger("focus"); return false; });
    }
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
Molecule3D.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    formula: PropTypes.string,
    url: PropTypes.string,
    smiles: PropTypes.string,
    data: PropTypes.string,
  }),
  options: PropTypes.shape({
    title: PropTypes.string,
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number.isRequired,
    }),
    molDrawType: PropTypes.string,
    bkgCol: PropTypes.string,
    txtCol: PropTypes.string,
    border: PropTypes.string,
    bkgGradientEnabled: PropTypes.bool,
    bkgGradientCols: PropTypes.arrayOf(PropTypes.string),
    customAtomColorsEnabled: PropTypes.bool,
    customAtomCols: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    customBondsEnabled: PropTypes.bool,
    customBondsColAndSize: PropTypes.arrayOf(PropTypes.string),
  }),
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
Molecule3D.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
};
//-------------------------------------------------------------------------------------------------
