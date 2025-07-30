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
import renderAtoms3D from './renderAtoms3D.js';
import * as THREE from 'three';


import './Cads_Component_TemplateVisStyles.css';
import $ from "jquery";
import convertExtentValues from '../Views/FormUtils';
import ASEView from '../Views/AseView.js'

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
export default function ASE ({
  data,
  mappings,
  options,
  colorTags,
  originalOptions,
  id,
  actions,
  updateView,
  dataset,
}) {

  async function handleSubmit(values){
    let newValues = {options:{ ...values }};
    let data = { content: "No" };
    newValues = convertExtentValues(newValues);
    const value = newValues.options.anotherThing;
    newValues.options.anotherThing = isNaN(Number(value)) ? 0 : Number(value);
    const view = {
      id: "1",
      name: "ASE",
      type: "ase",
      component: ASEView,         // Reactコンポーネントかラッパー関数
      deps: [],
      filter: [],
      properties: {},
      rgl: {},
      rglRules: {},
      settings: {
        options: {...internalOptions},
      },
    }
    // updateView(id, newValues);
    actions.sendRequestViewUpdate(view, newValues, data);
  };




  // Initiation of the VizComp
  const rootNode = useRef(null);
  const uid = "id"+id;
  let internalOptions = {...defaultOptions, ...options};
  const viewerRef = useRef(null);
  const textref = useRef(null);

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
          width: 500px;
        ">
        </div>
      </div>`
    );

    var outputContainer = $(rootNode.current).find("#outputContainer" + id);
    const Download_trajFile = $(rootNode.current).parent().parent().find('#trajFile' + id);
    Download_trajFile.off('click');
    Download_trajFile.on( "click", function () {
      if (!viewerRef.current) return;
      if(!internalOptions.anotherThing){ internalOptions.anotherThing = 1 };
      internalOptions.cell = viewerRef.current.getcell();
      internalOptions.atoms = viewerRef.current.getAtoms();
      internalOptions.positions = viewerRef.current.getPositions();
      internalOptions.pbc = viewerRef.current.getPBC();
      internalOptions.something = 'Download'
      handleSubmit(internalOptions)
    });
    const whatChoice = internalOptions.something || "";






    if(whatChoice == 'Create'){
      const whatParameter = internalOptions.anotherThing;

      outputContainer.html(`
        <div>
          <h1 class="compH1Style">3D Viewer for: ${'New Structure'}</h1>
          <div id="three-container${id}" style="width: 100%; height: 500px;"></div>
        </div>
      `);
      if (Object.keys(data).length !== 0) {
        if(data) viewerRef.current = renderAtoms3D(`#three-container${id}`, data);
      }
    }

    else if(whatChoice == 'Edit your files'){
      const whatParameter = internalOptions.diff.name;

      outputContainer.html(`
        <div>
          <h1 class="compH1Style">3D Viewer for: ${whatParameter}</h1>
          <div id="three-container${id}" style="width: 100%; height: 500px;"></div>
          <p
          ref=${textref}
          style={{ position: "absolute", bottom: 10, left: 10 }}
          >
          初期テキスト
          </p>
        </div>
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

  if(data.traj){
    const blob = base64ToBlob(data.traj);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'structure.traj'; 
    document.body.appendChild(a);
    setTimeout(() => {
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      data.traj = false
    }, 0);
  };

  // Only called at init and set our final exit function
  useEffect(() => {
    return () => { clearChart(); };
  }, []);

  // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
  }, [data, options]);

  useEffect(() => {
    if (data && Object.keys(data).length !== 0) {
      viewerRef.current = renderAtoms3D(`#three-container${id}`, data, setViewerText);
      // viewerRef.current.onClick(() => {
      //   if(textref.current){
      //     textref.current.textContent = "クリックされました"
      //   }
      // });
    }
  }, [data]);

  const [showForm, setShowForm] = useState(false);
  const [viewerText, setViewerText] = useState('');
  const [viewer, setViewer] = useState(null);
  const [atom, setAtom] = useState('');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [z, setZ] = useState('');
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowForm((prev) => !prev);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddAtom = () => {
    if (!atom || isNaN(x) || isNaN(y) || isNaN(z)) {
      alert('Enter the correct atoms and coordinates');
      return;
    }
    const position = [parseFloat(x),parseFloat(y),parseFloat(z) ];
    viewerRef.current.addObject(atom, position);
    setShowForm(false);
    setAtom('');
    setX('');
    setY('');
    setZ('');
  };

  // Add the VizComp to the DOM
  return (
    <div>
      <div ref={rootNode} />

      {showForm && (
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -30%)',
          backgroundColor: 'white',
          padding: '20px',
          border: '1px solid gray',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          zIndex: 1000,
        }}>
          <h2>Add Atom</h2>
          <div>
            <label>Atom:</label>
            <input type="text" value={atom} onChange={(e) => setAtom(e.target.value)} placeholder="H, C, O, etc." />
          </div>
          <div>
            <label>X:</label>
            <input type="number" value={x} onChange={(e) => setX(e.target.value)} />
          </div>
          <div>
            <label>Y:</label>
            <input type="number" value={y} onChange={(e) => setY(e.target.value)} />
          </div>
          <div>
            <label>Z:</label>
            <input type="number" value={z} onChange={(e) => setZ(e.target.value)} />
          </div>
          <br />
          <button onClick={handleAddAtom}>Add</button>
          <button onClick={() => setShowForm(false)} style={{ marginLeft: '10px' }}>Close</button>
        </div>
      )}
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


function base64ToBlob(base64, mimeType = 'application/octet-stream') {
  const byteCharacters = atob(base64);  // base64デコード
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: mimeType });
}






//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
ASE.propTypes = {
  data: PropTypes.shape({ }),
  options: PropTypes.shape({
    something: PropTypes.string,
    anotherThing: PropTypes.number,
    pbc: PropTypes.bool,
    cell: PropTypes.shape({
      a: PropTypes.number,
      b: PropTypes.number,
      c: PropTypes.number,
      alpha: PropTypes.number,
      beta: PropTypes.number,
      gamma: PropTypes.number,
    }),
    diff: PropTypes.shape({
      buffer:PropTypes.string,
      name:PropTypes.string
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
ASE.defaultProps = {
  data: {},
  options: defaultOptions,
  colorTags: [],
};
//-------------------------------------------------------------------------------------------------
