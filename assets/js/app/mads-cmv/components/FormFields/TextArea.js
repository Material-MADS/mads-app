/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of the 'TextArea' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'TextArea' is of classic TextArea type, look and feel.
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
const TextArea = ({ input, label, placeholder, meta: { touched, error, warning } }) => (
  <div>
    <label>{label}</label>
       <div>{JSON.stringify(error)}</div>
    <div>
      <textarea {...input} placeholder={placeholder} ></textarea>
      {touched &&
        ((error && <span><i style={{ color: '#9f3a38', fontWeight: 'bold' }}>{error}</i></span>) ||
          (warning && <span><i style={{ color: '#e07407', fontWeight: 'bold' }}>{warning}</i></span>))}
    </div>
  </div>
)
//-------------------------------------------------------------------------------------------------

export default TextArea;
