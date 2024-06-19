/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
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
// import Papa from 'papaparse';

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

// バリデーション関数
const validate = (values) => {
  const errors = {};
  console.log(values)
  if (!values.element) {
    errors.element = 'Required';
  }
  if (!values.energy) {
    errors.energy = 'Required';
  }
  if (!values.abs) {
    errors.abs = 'Required';
  }
  if (!values.XANES_Data) {
    errors.XANES_Data = 'Required';
  }
  if (!values.EXAFS_Data) {
    errors.EXAFS_Data = 'Required';
  }
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
      
      // 第1列と第2列のデータを抽出し、それぞれx軸とy軸のデータに設定
      const xData = parsedData.map(row => parseFloat(row[0]));
      const yData = parsedData.map(row => parseFloat(row[1]));
  
      // フォームの値を更新する
      props.change('XANES_Data', { XANES_x: xData, XANES_y: yData });
      setSelectedXANESFileName(file_XA.name);
  
      // Redux Form にフォームの更新を通知する
      props.touch('XANES_Data');
  
      // デバッグログ
      console.log("Parsed CSV Data: ", { XANES_x: xData, XANES_y: yData });
    };
  
    reader.readAsText(file_XA);
  };
  
  const fileChange_EX = e => {
    const file_EX = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = function(event) {
      const csvData = event.target.result;
      const parsedData = parseCSV(csvData);
      
      // 第1列と第2列のデータを抽出し、それぞれx軸とy軸のデータに設定
      const xData = parsedData.map(row => parseFloat(row[0]));
      const yData = parsedData.map(row => parseFloat(row[1]));
  
      // フォームの値を更新する
      props.change('EXAFS_Data', { EXAFS_x: xData, EXAFS_y: yData });
      setSelectedEXAFSFileName(file_EX.name);
  
      // Redux Form にフォームの更新を通知する
      props.touch('EXAFS_Data');
  
      // デバッグログ
      console.log("Parsed CSV Data: ", { EXAFS_x: xData, EXAFS_y: yData });
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
    // console.log("onSubmit is called");
    // console.log("File Data in onSubmit: ", fileData);
    // console.log("Submitted Values: ", valuesWithFileData);
    handleSubmit(valuesWithFileData); // handleSubmitの代わりに独自のハンドラを呼び出す場合
    // Reset the form after submission
    reset();
  };

  // useEffect(() => {
  //   // console.log("File Data updated: ", fileData);
  // }, [fileData]);

  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Analysis Element</label>
        <Field
          name="element"
          component={SemanticDropdown}
          placeholder="Element name (Required)"
          search
          options={getDropdownOptions(methods)}
        />
      </Form.Field>

      <Form.Field>
        <label>Energy</label>
        <Field
          name="energy"
          component={SemanticDropdown}
          placeholder="X / Energy (Required)"
          search
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Abs.</label>
        <Field
          name="abs"
          component={SemanticDropdown}
          placeholder="Y / Abs (Required)"
          search
          options={columns}
        />
      </Form.Field>    

      <Form.Field width={12}>
        <label>
          XANES Data:
          <Button as="label" htmlFor="xanesfile" type="button" color="blue" style={{fontSize: "14px", padding: "4px", fontWeight: "bold", height: "22px", marginLeft: "5px"}}>
            Load File
          </Button>
        </label>
        <input type="file" id="xanesfile" style={{ display: "none" }} onChange={fileChange_XA} name='XANES_Data' required/>
        <input 
          type='hidden'
          name='XANES_Data'/>
        <span id="xanesfileLabel">{selectedXANESFileName}</span> {/* ファイル名を表示するための要素 */}
      </Form.Field>

      <Form.Field width={12}>
        <label>
          EXAFS Data:
          <Button as="label" htmlFor="exafsfile" type="button" color="blue" style={{fontSize: "14px", padding: "4px", fontWeight: "bold", height: "22px", marginLeft: "5px"}} >
            Load File
          </Button>
        </label>
        <input type="file" id="exafsfile" style={{ display: "none" }} onChange={fileChange_EX} name='EXAFS_Data' required/>
        <input 
          type='hidden'
          name='EXAFS_Data'/>
        <span id="exafsfileLabel">{selectedEXAFSFileName}</span> {/* ファイル名を表示するための要素 */}
      </Form.Field>
    </Form>
  );
};

export default reduxForm({
  form: 'XAFSAnalysis',
  validate,
})(XAFSAnalysisForm);