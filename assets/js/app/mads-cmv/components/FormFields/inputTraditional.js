/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of the 'InputTraditional' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'InputTraditional' is of classic Input type, look and feel.
//        (that does not use semantic-ui-react)
// ------------------------------------------------------------------------------------------------
// References: React Lib
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The FormField Component
//-------------------------------------------------------------------------------------------------
const inputTrad = ({ input, label, type, min, max, step, disabled, style, meta: { touched, error, warning }, value }) => (
  <div>
    <label>{label}</label>
    <div>{JSON.stringify(error)}</div>
    <div>
      <input
        {...input}
        placeholder={label}
        type={type}
        style={style}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
      {touched &&
        ((error && <span><i style={{ color: '#9f3a38', fontWeight: 'bold' }}>{error}</i></span>) ||
          (warning && <span><i style={{ color: '#e07407', fontWeight: 'bold' }}>{warning}</i></span>))}
    </div>
  </div>
);
//-------------------------------------------------------------------------------------------------

export default inputTrad;
