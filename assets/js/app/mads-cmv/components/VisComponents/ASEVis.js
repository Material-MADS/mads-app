/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2025
// ________________________________________________________________________________________________
// Authors: Shotaro Okamoto [2025]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the
//              'Atomic Simulation Environment' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Atomic Simulation Environment' is a component that makes amazing things.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party jquery, internal support methods fr. VisCompUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Popup } from 'semantic-ui-react';
import PropTypes from "prop-types";
import renderAtoms3D from './componentSupport/renderAtoms3D.js';



import './Cads_Component_TemplateVisStyles.css';
import $ from "jquery";
import convertExtentValues from '../Views/FormUtils';
import ASEView from '../Views/AseView.js'

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  something: "Upload",
  extent: { width: undefined, height: undefined },
};

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Component Default and Initial Options / Settings
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function ASE ({
  data,
  options,
  id,
  actions,
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
    actions.sendRequestViewUpdate(view, newValues, data);
  };




  // Initiation of the VizComp
  const rootNode = useRef(null);
  const uid = "id"+id;
  let internalOptions = {...defaultOptions, ...options};
  const viewerRef = useRef(null);
  const containerRef = useRef(null)

  const initialdata = { 'numbers':[],'positions':[],};  

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
      </div>
      <div name="instCont" 
          style="width: 560px; text-align: left; margin-top: -20px; line-height: 1.4; cursor: pointer;">
        <span name="molViewInstrHdr" style="font-size: 14px; font-weight: bold;">
          Click to show Full Instructions:<br/>
        </span>
        <section aria-labelledby="fi-title" name="instr" 
                style="font-weight: normal; display: none; 
                        max-height: 120px;
                        overflow-y: auto; 
                        overflow-x: hidden;
                        word-break: break-word;
                        white-space: normal; 
                        padding-right: 5px;
                        box-sizing: border-box;
                        text-align: left;">
          <p>
            This component provides an interactive environment for visualizing and editing atomic structures.
            You can select atoms, measure geometrical properties, manipulate the view, and manage structure files.
          </p>
          <section aria-labelledby="fi-viewcontrol">
            <h3 id="fi-viewcontrol" style="margin: 0">Controlling the View</h3>
            <ul style="margin-top: 0; padding-left: 18px; max-width: 100%; word-break: break-word;">
              <li><strong>Rotate view:</strong> Right-click and drag to rotate the camera around the model.</li>
              <li><strong>Pan view:</strong> Hold the <kbd>Ctrl</kbd> key while right-clicking and dragging to move the camera parallel to the viewing plane.</li>
            </ul>
          </section>
          <section aria-labelledby="fi-selecting">
            <h3 id="fi-selecting" style="margin: 0">Selecting Atoms</h3>
            <ul style="margin-top: 0; padding-left: 18px; max-width: 100%; word-break: break-word;">
              <li><strong>Single selection:</strong> Left-click on an atom to select it.</li>
              <li><strong>Multiple selection:</strong> Click and drag with the left mouse button to draw a rectangle and select multiple atoms.</li>
              <li><strong>Add to selection:</strong> Hold the <kbd>Ctrl</kbd> key while left-clicking to keep the current selection and add additional atoms.</li>
            </ul>
          </section> 
          <section aria-labelledby="fi-geometry">
            <h3 id="fi-geometry" style="margin: 0">Measuring Geometry</h3>
            <ul style="margin-top: 0; padding-left: 18px; max-width: 100%; word-break: break-word;">
              <li><strong>One atom selected:</strong> Its 3D coordinates are displayed.</li>
              <li><strong>Two atoms selected:</strong> The distance between them is shown.</li>
              <li><strong>Three atoms selected:</strong> The angle defined by the triangle is calculated.</li>
            </ul>
          </section>
          <section aria-labelledby="fi-files">
            <h3 id="fi-files" style="margin: 0">Working with Structure Files</h3>
            <p style="margin: 0; max-width: 100%; word-break: break-word;">
              Upload an atomic structure file to begin editing.<br/>
              To upload, click the <strong>Configure</strong> button.
            </p>
          </section>
        </section>
      </div>`
    );

    var outputContainer = $(rootNode.current).find("#outputContainer" + id);


    outputContainer.html(`
      <div>
        <h1 class="compH1Style">3D Viewer</h1>
        <div ref=${containerRef} id="three-container${id}" style="width: 100%; height: 500px;"></div>
          <p id="viewer-text-${id}" style="
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255,255,255,0.8);
          padding: 4px;
        ">
        </p>
      </div>
    `);
    viewerRef.current = renderAtoms3D(`#three-container${id}`, initialdata, setViewerText, setCellVectors);
  };

   // Clear away the VizComp
   const clearChart = () => {
    /* Called when component is deleted */
  };

  // Only called at init and set our final exit function
  useEffect(() => {
    return () => { clearChart(); };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      viewerRef.current = renderAtoms3D(`#three-container${id}`, initialdata, setViewerText, setCellVectors);
    }
  }, [containerRef.current]);

  // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
  }, [options]);

  useEffect(() => {
    if(data.uploaded){
      viewerRef.current = renderAtoms3D(`#three-container${id}`, data, setViewerText);
      setCellVectors(data.cell);
      setCellLengths(data.cellpar);
      setCurrentVectors(data.cell);
      setPbc(data.pbc);
    }
  }, [data]);

  const toggleInstructions = $(rootNode.current).parent().parent().find("[name='instCont']");
  toggleInstructions.off('click');
  toggleInstructions.on( "click", function () {
    var inst = $(rootNode.current).parent().parent().find("[name='instr']");
    if(inst.is(":visible")){ $(rootNode.current).parent().parent().find("[name='instr']").hide(); }
    else{ $(rootNode.current).parent().parent().find("[name='instr']").show(); }
  });


  const [addForm, setAddForm] = useState(false);
  const [cellForm, setCellForm] = useState(false);
  const [modifyForm, setModifyForm] = useState(false);
  const [downloadForm, setDownloadForm] = useState(false);
  const [viewerText, setViewerText] = useState('');
  const [atom, setAtom] = useState('');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [z, setZ] = useState('');

  const [inputMode, setInputMode] = useState('vectors'); // 'vectors' or 'lengths'
  const [cellVectors, setCellVectors] = useState([[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]]);
  const [currentVectors, setCurrentVectors] = useState([[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]]);
  const [cellLengths, setCellLengths] = useState([0.0, 0.0, 0.0, 90.0, 90.0, 90.0]);
  const [element, setElement] = useState('');
  const [filename, setFilename] = useState('');
  const [format, setFormat] = useState('');

  const [pbc, setPbc] = useState([false,false,false]);

  const handleVectorChange = (axisIndex, componentIndex, newValue) => {
    const updatedVectors = [...viewerRef.current.getCell()];
    updatedVectors[axisIndex] = [...updatedVectors[axisIndex]];
    if(newValue){
      updatedVectors[axisIndex][componentIndex] = parseFloat(newValue);
      setCellLengths(cell_to_cellpar(updatedVectors));
      viewerRef.current.setCell(updatedVectors); 
    }else{
      updatedVectors[axisIndex][componentIndex] = newValue;
    }
    setCellVectors(updatedVectors);
  };

  const handleLengthChange = (index, value) => {
    const newLengths = [...cellLengths];
    if(value){
      newLengths[index] = parseFloat(value);
      const updatedVectors = cellpar_to_cell(newLengths);
      viewerRef.current.setCell(updatedVectors);
      setCellVectors(updatedVectors);
    }else{
      newLengths[index] = value;
    }
    setCellLengths(newLengths);
  };

  const handleCheckboxChange = (index) => {
    const newPbc = [...pbc];
    newPbc[index] = !newPbc[index];
    setPbc(newPbc);
  };
  
  useEffect(() => {
    $(`#viewer-text-${id}`).text(viewerText);
  }, [viewerText]);

  useEffect(() => {
    setCellVectors(currentVectors);
    setCellLengths(cell_to_cellpar(currentVectors));
    setPbc(viewerRef.current.getPBC());
  }, [currentVectors]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      const identification = document.activeElement.getAttribute("id");
      if(identification == `#three-container${id}`){
         if (e.key === "Backspace") {
          e.preventDefault();
          viewerRef.current.deleteAtoms();
        }
        else if (e.ctrlKey){
          if(e.key.toLowerCase() === 'a'){
            e.preventDefault();
            setAddForm((prev) => !prev);
          }
          else if(e.key.toLowerCase() === 'e'){
            e.preventDefault();
            setCellForm((prev) => !prev);
          }
          else if(e.key.toLowerCase() === 'm'){
            e.preventDefault();
            viewerRef.current.setMove();
          }
          else if(e.key.toLowerCase() === 'r'){
            e.preventDefault();
            viewerRef.current.setRotate();
          }
          else if (e.key.toLowerCase() === 'c') {
            e.preventDefault();
            viewerRef.current.copy();
          }
          else if (e.key.toLowerCase() === 'x') {
            e.preventDefault();
            viewerRef.current.cut();
          }
          else if (e.key.toLowerCase() === 'v') {
            e.preventDefault();
            viewerRef.current.paste(setCurrentVectors);
          }
          else if (e.key.toLowerCase() === 'y') {
            e.preventDefault();
            setModifyForm((prev) => !prev);
          }
          else if (e.key.toLowerCase() === 's') {
            e.preventDefault();
            setDownloadForm((prev) => !prev);
          }          
        }
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
    setAtom('');
    setX('');
    setY('');
    setZ('');
  };

  const handleEditCell = () => {
    if (inputMode === 'vectors') {
      setCurrentVectors(cellVectors);
    } else {
      setCurrentVectors(cellpar_to_cell(cellLengths));
    }
    viewerRef.current.setPBC(pbc)
    setCellForm(false); 
  };

  const handleModifyAtoms = () => {
    viewerRef.current.modify(element)
    setElement('');
  };

  const handleDownload = () => {
    if (!viewerRef.current) return;
    if (!internalOptions.download) internalOptions.download = {};
    internalOptions.download.cell = viewerRef.current.getCell();
    internalOptions.download.atoms = viewerRef.current.getNumbers();
    internalOptions.download.positions = viewerRef.current.getPositions();
    internalOptions.download.pbc = viewerRef.current.getPBC();
    internalOptions.download.format = format;
    internalOptions.something = 'Download';
    handleSubmit(internalOptions);
    setDownloadForm(false);
  };

  if(data.file){
    const blob = base64ToBlob(data.file);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename+'.'+format; 
    document.body.appendChild(a);
    setTimeout(() => {
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      data.file = false
    }, 0);
  };





  const [fileOpen, setFileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [transformOpen, setTransformOpen] = useState(false);
  // Add the VizComp to the DOM
  const fileRef = useRef(null);
  const editRef = useRef(null);
  const toolsRef = useRef(null);
  const transformRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        fileRef.current &&
        !fileRef.current.contains(event.target) &&
        editRef.current &&
        !editRef.current.contains(event.target)&&
        toolsRef.current &&
        !toolsRef.current.contains(event.target)&&
        transformRef.current &&
        !transformRef.current.contains(event.target)
      ) {
        setFileOpen(false);
        setEditOpen(false);
        setToolsOpen(false);
        setTransformOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div>
      {/* 📂 menu */}
      <div style={{ display: 'inline-flex', gap: '20px', background: '#f0f0f0', padding: '5px 10px' }}>
        {/* File menu */}
        <div style={{ position: 'relative' }} ref={fileRef}>
          <span
            style={{ cursor: 'pointer', borderBottom: '1px solid gray', paddingBottom: '2px' }}
            onClick={() => {
              setFileOpen(!fileOpen);
              setEditOpen(false);
              setToolsOpen(false);
              setTransformOpen(false);
            }}
          >
            File ▾
          </span>
          {fileOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'white',
                border: '1px solid gray',
                zIndex: 10,
                width: '150px',
              }}
            >
              <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => {
                setDownloadForm(true);
                setFileOpen(false);
              }}>
                <Popup trigger={<span>Download : Ctrl + S</span>} content="Export the current structure in the specified format." size='small' />
              </div>
            </div>
          )}
        </div>
  
        {/* Tools menu */}
        <div style={{ position: 'relative' }} ref={toolsRef}>
          <span
            style={{ cursor: 'pointer', borderBottom: '1px solid gray', paddingBottom: '2px' }}
            onClick={() => {
              setToolsOpen(!toolsOpen);
              setFileOpen(false);
              setTransformOpen(false);
              setEditOpen(false);
            }}
          >
            Tools ▾
          </span>
          {toolsOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'white',
                border: '1px solid gray',
                zIndex: 10,
                width: '150px',
              }}
            >
              <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => {
                viewerRef.current.copy();
                setToolsOpen(false);
              }}>
                <Popup trigger={<span>Copy : Ctrl + C</span>} content="Copy the selected atom(s) to the clipboard." size='small' />
              </div>
              <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => {
                viewerRef.current.cut();
                setToolsOpen(false);
              }}>
                <Popup trigger={<span>Cut : Ctrl + X</span>} content="Remove the selected atom(s) and copy them to the clipboard." size='small' />
              </div>
              <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => {
                viewerRef.current.paste(setCurrentVectors);
                setToolsOpen(false);
              }}>
                <Popup trigger={<span>Paste : Ctrl + V</span>} content="Insert atom(s) from the clipboard into the current structure." size='small' />
              </div>
              <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => {
                viewerRef.current.deleteAtoms();
                setToolsOpen(false);
              }}>
                <Popup trigger={<span>Delete : Backspace</span>} content="Remove the selected atom(s) without copying." size='small' />
              </div>
            </div>
          )}
        </div>

        {/* Edit menu */}
        <div style={{ position: 'relative' }} ref={editRef}>
          <span
            style={{ cursor: 'pointer', borderBottom: '1px solid gray', paddingBottom: '2px' }}
            onClick={() => {
              setEditOpen(!editOpen);
              setFileOpen(false);
              setToolsOpen(false);
              setTransformOpen(false);
            }}
          >
            Edit ▾
          </span>
          {editOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'white',
                border: '1px solid gray',
                zIndex: 10,
                width: '150px',
              }}
            >
              <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => {
                setAddForm(true);
                setEditOpen(false);
              }}>
                <Popup trigger={<span>Add Atom : Ctrl + A</span>} content="Add a new atom at a specified position." size='small' />
              </div>
              <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => {
                setCellForm(true);
                setEditOpen(false);
              }}>
                <Popup trigger={<span>Edit Cell : Ctrl + E</span>} content="Modify the cell parameters (lattice vectors, dimensions)." size='small' />
              </div>
              <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => {
                setModifyForm(true);
                setEditOpen(false);
              }}>
                <Popup trigger={<span>Change : Ctrl + Y</span>} content="Edit the element type of the selected atom(s)" size='small' />
              </div>
            </div>
          )}
        </div>
        
        {/* Transform menu */}
        <div style={{ position: 'relative' }} ref={transformRef}>
          <span
            style={{ cursor: 'pointer', borderBottom: '1px solid gray', paddingBottom: '2px' }}
            onClick={() => {
              setFileOpen(false);
              setEditOpen(false);
              setToolsOpen(false);
              setTransformOpen(!transformOpen);
            }}
          >
            Transform ▾
          </span>
          {transformOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'white',
                border: '1px solid gray',
                zIndex: 10,
                width: '150px',
              }}
            >
              <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => {
                console.log("moved")
                viewerRef.current.setMove();
                setTransformOpen(false);
              }}>
                <Popup trigger={<span>Move : Ctrl + M</span>} content="Translate the selected atom(s) up, down, left, or right." size='small' />
              </div>
              <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => {
                viewerRef.current.setRotate();
                setTransformOpen(false);
              }}>
                <Popup trigger={<span>Rotate : Ctrl + R</span>} content="Rotate the selected atom(s) around their center of mass." size='small' />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🧪 Three.js viewer */}
      <div ref={rootNode} />      
  
      {/* ➕ Atom Add Form */}
      {addForm && (
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
            <label>Add:</label>
            <input style={{ width: '80px', margin: '0 10px' }} type="text" value={atom} onChange={(e) => setAtom(e.target.value)} placeholder="H, C, O, etc." />
          </div>
          <div>
            <label>X:</label>
            <input style={{ width: '80px', margin: '0 10px' }} type="number" value={x} onChange={(e) => setX(e.target.value)} />
          </div>
          <div>
            <label>Y:</label>
            <input style={{ width: '80px', margin: '0 10px' }} type="number" value={y} onChange={(e) => setY(e.target.value)} />
          </div>
          <div>
            <label>Z:</label>
            <input style={{ width: '80px', margin: '0 10px' }} type="number" value={z} onChange={(e) => setZ(e.target.value)} />
          </div>
          <br />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setAddForm(false)} style={{ marginRight: '10px' }}>Close</button>
            <button onClick={handleAddAtom}>Add</button>
          </div>
        </div>
      )}

      {/* ➕ Cell Edit Form */}
      {cellForm && (
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)', backgroundColor: 'white', padding: '20px', border: '1px solid gray', boxShadow: '0 0 10px rgba(0,0,0,0.3)', zIndex: 1000, width: 'fit-content',}}>
          <h2>Cell Editor</h2>
          <div style={{ marginBottom: '10px' }}>
            <label>
              <input type="radio" value="vectors" checked={inputMode === 'vectors'} onChange={() => setInputMode('vectors')}/>
              <span style={{ color: inputMode === 'vectors' ? 'black' : 'lightgray', marginLeft: '5px' }}>Cell Vectors</span>
            </label>
            &nbsp;&nbsp;
            <label>
              <input type="radio" value="lengths" checked={inputMode === 'lengths'} onChange={() => setInputMode('lengths')}/>
              <span style={{ color: inputMode === 'lengths' ? 'black' : 'lightgray', marginLeft: '5px' }}>Lengths & Angles</span>
            </label>
          </div>
          {inputMode === 'vectors' ? (
            <>
              {cellVectors.map((vector, axisIndex) => (
                <div key={axisIndex} style={{ marginBottom: '5px' }}>
                  {'ABC'[axisIndex]}:
                  {vector.map((value, index) => (
                    <input
                      key={index}
                      type="number"
                      step="0.1"
                      value={value}
                      onChange={(e) =>
                        handleVectorChange(axisIndex, index, e.target.value)
                      }
                      style={{ width: '80px', margin: '0 4px' }}
                    />
                  ))}
                </div>
              ))}
            </>
          ):(
            <>
              <div style={{ marginBottom: "5px", width: '460px' }}>
                ||A||:
                <input
                  type="number"
                  step="0.1"
                  value={cellLengths[0]}
                  onChange={(e) => handleLengthChange(0, e.target.value)}
                  style={{ width: '80px', margin: '0 10px' }}
                />
                ||B||:
                <input
                  type="number"
                  step="0.1"
                  value={cellLengths[1]}
                  onChange={(e) => handleLengthChange(1, e.target.value)}
                  style={{ width: '80px', margin: '0 10px' }}
                />
                ||C||:
                <input
                  type="number"
                  step="0.1"
                  value={cellLengths[2]}
                  onChange={(e) => handleLengthChange(2, e.target.value)}
                  style={{ width: '80px', margin: '0 10px' }}
                />
              </div>

              <div style={{ marginBottom: '5px' }}>
                ∠BC:
                <input
                  type="number"
                  step="1"
                  value={cellLengths[3]}
                  onChange={(e) => handleLengthChange(3, e.target.value)}
                  style={{ width: '80px', margin: '0 10px' }}
                />
                ∠AC:
                <input
                  type="number"
                  step="1"
                  value={cellLengths[4]}
                  onChange={(e) => handleLengthChange(4, e.target.value)}
                  style={{ width: '80px', margin: '0 10px' }}
                />
                ∠AB:
                <input
                  type="number"
                  step="1"
                  value={cellLengths[5]}
                  onChange={(e) => handleLengthChange(5, e.target.value)}
                  style={{ width: '80px', margin: '0 10px' }}
                />
              </div>
            </>
          )}

          <div style={{ marginTop: '10px', marginBottom: '10px' }}>
            periodic - A:
            <input
              type="checkbox"
              checked={pbc[0]}
              onChange={() => handleCheckboxChange(0)}
            />
            B:
            <input
              type="checkbox"
              checked={pbc[1]}
              onChange={() => handleCheckboxChange(1)}
            />
            C:
            <input
              type="checkbox"
              checked={pbc[2]}
              onChange={() => handleCheckboxChange(2)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => {
              setCellForm(false);
              setCellVectors(currentVectors);
              setCellLengths(cell_to_cellpar(currentVectors));
              viewerRef.current.setCell(currentVectors);
              }} style={{ marginRight: '10px' }}>Cancel</button>
            <button onClick={handleEditCell}>Apply</button>
          </div>


        </div>
      )}

      {/* ➕ Atom Modify Form  */}
      {modifyForm && (
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -30%)',
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid gray',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          zIndex: 1000,
        }}>
          <h2>Modify</h2>
          <div>
            <label>Element:</label>
            <input type="text" style={{width: '30px'}} value={element} onChange={(e) => setElement(e.target.value)} />
            <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Enter a chemical symbol.' size='small' />
          </div>
          <br />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setModifyForm(false)} style={{ marginRight: '10px' }}>Cancel</button>
            <button onClick={handleModifyAtoms}>Change elements</button>
          </div>
        </div>
      )}

      {/*  Download Form  */}
      {downloadForm && (
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -30%)',
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid gray',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          zIndex: 1000,
        }}>
          <h2>Download</h2>
          <div>
            <label>File name:</label>
            <div>
              <input type="text" style={{width: '65px'}} value={filename} placeholder="example" onChange={(e) => setFilename(e.target.value)} />
              <span> . </span>
              <input type="text" style={{width: '40px'}} value={format} placeholder="traj" onChange={(e) => setFormat(e.target.value)} />
              <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content="Enter the download file name." size='small' />
            </div>
          </div>
          <br />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setDownloadForm(false)} style={{ marginRight: '10px' }}>Cancel</button>
            <button onClick={handleDownload}>Download</button>
          </div>
        </div>
      )}

    </div>
  );
}
//-------------------------------------------------------------------------------------------------


function base64ToBlob(base64, mimeType = 'application/octet-stream') {
  const byteCharacters = atob(base64); 
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: mimeType });
}

const toDegrees = (rad) => rad * 180 / Math.PI;
const toRadians = (deg) => deg * Math.PI / 180;

function cellpar_to_cell([a, b, c, alphaDeg, betaDeg, gammaDeg]) {
  const alpha = toRadians(alphaDeg);
  const beta = toRadians(betaDeg);
  const gamma = toRadians(gammaDeg);

  const ax = a;
  const ay = 0.000;
  const az = 0.000;

  const bx = nearZero(b * Math.cos(gamma));
  const by = nearZero(b * Math.sin(gamma));
  const bz = 0.000;

  const cx = nearZero(c * Math.cos(beta));
  const cy = nearZero((c * Math.cos(alpha) - cx * Math.cos(gamma)) / Math.sin(gamma));
  const cz = nearZero(Math.sqrt(c ** 2 - cx ** 2 - cy ** 2));

  return [
    [ax, ay, az],
    [bx, by, bz],
    [cx, cy, cz]
  ];
}

function cell_to_cellpar(cell) {
  const [aVec, bVec, cVec] = cell;

  const norm = (v) => Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
  const dot = (u, v) => u[0]*v[0] + u[1]*v[1] + u[2]*v[2];

  const a = norm(aVec);
  const b = norm(bVec);
  const c = norm(cVec);

  var alpha = toDegrees(Math.acos(dot(bVec, cVec) / (b * c)));
  var beta  = toDegrees(Math.acos(dot(aVec, cVec) / (a * c)));
  var gamma = toDegrees(Math.acos(dot(aVec, bVec) / (a * b)));
  if(!alpha){
    alpha = 90.0;
  }
  if(!beta){
    beta = 90.0;
  }
  if(!gamma){
    gamma = 90.0;
  }

  return [a, b, c, alpha, beta, gamma];
}

function nearZero(x, tol = 1e-10) {
  return Math.abs(x) < tol ? 0 : x;
}




//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
ASE.propTypes = {
  data: PropTypes.shape({ }),
  options: PropTypes.shape({
    something: PropTypes.string,
    upload: PropTypes.shape({
      buffer:PropTypes.string,
      name:PropTypes.string,
    }),
    download: PropTypes.shape({
      filename:PropTypes.string,
      extension:PropTypes.string,
      pbc: PropTypes.bool,
      cell: PropTypes.shape({
        a: PropTypes.number,
        b: PropTypes.number,
        c: PropTypes.number,
        alpha: PropTypes.number,
        beta: PropTypes.number,
        gamma: PropTypes.number,
      }),
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
