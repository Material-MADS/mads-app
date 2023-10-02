/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of the 'DropDown' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'DropDown' is of classic type, look and feel. (Single selection only)
// ------------------------------------------------------------------------------------------------
// References: React, prop-types & semantic-ui-react Libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Dropdown } from 'semantic-ui-react';
import { selection } from 'd3';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The FormField Component
//-------------------------------------------------------------------------------------------------
const SemanticDropdown = ({
  input,
  type,
  label,
  placeholder,
  renderLabel,
  styleMaker=styleMaker || (() => {return {}}),
  meta: { touched, error, warning },
  ...props
}) =>{
  return (
  <Form.Field>
    <Dropdown
      style={styleMaker(input.value)}
      fluid
      selection
      {...input}
      {...props}
      onBlur={() => input.onBlur()}
      value={input.value}
      onChange={(param, data) => input.onChange(data.value)}
      error={true && error && warning}
      label={label}
      placeholder={placeholder}
    />
    {warning && <div>{JSON.stringify(error)}</div>}
    <Form.Field>
      {true &&
        ((error && <i style={{ color: '#9f3a38', fontWeight: 'bold' }}>{error}</i>) ||
          (warning && <i style={{ color: '#e07407', fontWeight: 'bold' }}>{warning}</i>))}
    </Form.Field>
  </Form.Field>
)};
//-------------------------------------------------------------------------------------------------

export default SemanticDropdown;
