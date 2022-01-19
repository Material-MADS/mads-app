/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of the 'Input' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'Input' is of classic Input type, look and feel.
// ------------------------------------------------------------------------------------------------
// References: React, prop-types & semantic-ui-react Libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'semantic-ui-react';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The FormField Component
//-------------------------------------------------------------------------------------------------
const SemanticInput = ({
  input,
  type,
  label,
  placeholder,
  meta: { touched, error, warning },
  ...props
}) =>{
  return (
  <Form.Field>
    <Input
      {...input}
      {...props}
      type={type}
      onBlur={() => input.onBlur()}
      value={input.value}
      onChange={(param, data) => input.onChange(data.value)}
      error={touched && error && true}
      label={label}
      placeholder={placeholder}
    />
    <Form.Field>
      {touched &&
        ((error && <i style={{ color: '#9f3a38', fontWeight: 'bold' }}>{error}</i>) ||
          (warning && <i style={{ color: '#e07407', fontWeight: 'bold' }}>{warning}</i>))}
    </Form.Field>
  </Form.Field>
)};
//-------------------------------------------------------------------------------------------------

export default SemanticInput;
