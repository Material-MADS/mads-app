/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2024
// ________________________________________________________________________________________________
// Authors: Miyasaka Naotoshi [2024-] 
//          Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'XAFSAnalysis' View,
--              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'ClassficiationForm' opens a customized form for a 'XAFSAnalysis' view of a type
//        of Scatter and Line chart visualization component and allows the user to edit its look,
//        feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components,
//             Internal Serverside API access
=================================================================================================*/

//*** TODO: Convert this to have the same look and feel to the code as other forms...
//*** TODO: Could this be deleted, and just leave the Scatter Plot with some new settings to replace them

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useRef, useEffect } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Button, Confirm, Form, Modal } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';
import ModelNameForm from './ModelNameForm';

import api from '../../api';

import SemCheckbox from '../FormFields/Checkbox';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Initiation Values
//-------------------------------------------------------------------------------------------------

//=======================
const getDropdownOptions = (list) =>
  list.map((i) => ({ key: i, text: i, value: i }));
//=======================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================

// Validation Functions
const validate = (values) => {
  const errors = {};
  if (!values.element) {
    errors.element = 'Required';
  }
  if (!values.energy) {
    errors.energy = 'Required';
  }
  if (!values.abs) {
    errors.abs = 'Required';
  }
  if (!values.XANES_Data || !values.XANES_Data.XANES_x.length || !values.XANES_Data.XANES_y.length) {
    errors.XANES_Data = 'Required';
  }
  if (!values.EXAFS_Data || !values.EXAFS_Data.EXAFS_x.length || !values.EXAFS_Data.EXAFS_y.length) {
    errors.EXAFS_Data = 'Required';
  }

  setSubmitButtonDisable( errors.element || errors.energy || errors.abs || errors.XANES_Data || errors.EXAFS_Data);

  return errors;
};

const XAFSAnalysisForm = (props) => {
  const { handleSubmit, columns, reset } = props;
  
  const methods = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe',
                   'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 
                   'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W',
                   'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu'];

  const [selectedXANESFileName, setSelectedXANESFileName] = useState('');
  const [selectedEXAFSFileName, setSelectedEXAFSFileName] = useState('');
  const [fileData_XA, setFileData_XA] = useState({ XANES_x: [], XANES_y: [] });
  const [fileData_EX, setFileData_EX] = useState({ EXAFS_x: [], EXAFS_y: [] });


  const fileChange_XA = e => {
    const file_XA = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = function(event) {
      const csvData = event.target.result;
      const parsedData = parseCSV(csvData);
      
      // Extract data from columns 1 and 2 and set them to x- and y-axis data, respectively
      const xData = parsedData.map(row => parseFloat(row[0]));
      const yData = parsedData.map(row => parseFloat(row[1]));
  
      // Update form values
      props.change('XANES_Data', { XANES_x: xData, XANES_y: yData });
      setSelectedXANESFileName(file_XA.name);
  
      // Notify Redux Form of form updates
      props.touch('XANES_Data');
  
      // console.log("Parsed CSV Data: ", { XANES_x: xData, XANES_y: yData });
    };
  
    reader.readAsText(file_XA);
  };
  
  const fileChange_EX = e => {
    const file_EX = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = function(event) {
      const csvData = event.target.result;
      const parsedData = parseCSV(csvData);
      
      const xData = parsedData.map(row => parseFloat(row[0]));
      const yData = parsedData.map(row => parseFloat(row[1]));
  
      props.change('EXAFS_Data', { EXAFS_x: xData, EXAFS_y: yData });
      setSelectedEXAFSFileName(file_EX.name);
  
      props.touch('EXAFS_Data');

      // console.log("Parsed CSV Data: ", { EXAFS_x: xData, EXAFS_y: yData });
    };
  
    reader.readAsText(file_EX);
  };
  
  const parseCSV = csvData => {
    const lines = csvData.split("\n");
    const result = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].split(",");
      result.push(line);
    }
    return result;
  };

  const onSubmit = (values) => {
    const valuesWithFileData = { ...values, XANES_Data: fileData_XA, EXAFS_Data: fileData_EX };
    handleSubmit(valuesWithFileData); 
    // Reset the form after submission
    reset();
  };

  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Analysis Element</label>
        <Field
          name="element"
          component={SemanticDropdown}
          placeholder="Element name"
          search
          options={getDropdownOptions(methods)}
        />
      </Form.Field>

      <Form.Field>
        <label>Energy</label>
        <Field
          name="energy"
          component={SemanticDropdown}
          placeholder="X / Energy"
          search
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Abs.</label>
        <Field
          name="abs"
          component={SemanticDropdown}
          placeholder="Y / Abs"
          search
          options={columns}
        />
      </Form.Field>    

      <Form.Field width={15}>
        <label>
          XANES Data:
          <Button as="label" htmlFor="xanesfile" type="button" color="blue" style={{fontSize: "14px", padding: "4px", fontWeight: "bold", height: "22px", marginLeft: "5px"}}>
            Load File
          </Button>
          <a href="https://github.com/naopyonlove01/XAFSAnalysis" target="_blank" rel="noopener noreferrer" style={{ marginLeft: "10px" }}>
            How to create XANES Data File
          </a>
        </label>
        <input type="file" id="xanesfile" style={{ display: "none" }} onChange={fileChange_XA} name='XANES_Data' required/>
        <input 
          type='hidden'
          name='XANES_Data'/>
        <span id="xanesfileLabel" style={{ color: selectedXANESFileName ? 'black' : 'red' }}>
          {selectedXANESFileName || 'Required'}
        </span>
      </Form.Field>

      <Form.Field width={15}>
        <label>
          EXAFS Data:
          <Button as="label" htmlFor="exafsfile" type="button" color="blue" style={{fontSize: "14px", padding: "4px", fontWeight: "bold", height: "22px", marginLeft: "5px"}} >
            Load File
          </Button>
          <a href="https://github.com/naopyonlove01/XAFSAnalysis" target="_blank" rel="noopener noreferrer" style={{ marginLeft: "10px" }}>
            How to create EXAFS Data File
          </a>
        </label>
        <input type="file" id="exafsfile" style={{ display: "none" }} onChange={fileChange_EX} name='EXAFS_Data' required/>
        <input 
          type='hidden'
          name='EXAFS_Data'/>
        <span id="exafsfileLabel" style={{ color: selectedEXAFSFileName ? 'black' : 'red' }}>
          {selectedEXAFSFileName || 'Required'}
        </span>
      </Form.Field>

      <hr />

      <Form.Group widths="equal">
        <label>Graph Size:</label>

        <Field
          fluid
          name="options.extent.width"
          component={Input}
          placeholder="Width"
        />
        <Field
          fluid
          name="options.extent.height"
          component={Input}
          placeholder="Height"
        />
      </Form.Group>
    </Form>
  );
};

export default reduxForm({
  form: 'XAFSAnalysis',
  validate,
})(XAFSAnalysisForm);