/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of the 'Multi Select DropDown' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'Multi Select DropDown' is of classic type, look and feel. (Multiple Select)
// ------------------------------------------------------------------------------------------------
// References: React, prop-types & semantic-ui-react Libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Dropdown } from 'semantic-ui-react';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The FormField Component
//-------------------------------------------------------------------------------------------------
const MultiSelectDropdown = ({
  input,
  type,
  label,
  placeholder,
  meta: { touched, error, warning },
  ...props
}) => (
  <Form.Field>
    <Dropdown
      fluid
      multiple
      selection
      {...input}
      {...props}
      onBlur={() => input.onBlur()}
      value={input.value || []}
      onChange={(param, data) => input.onChange(data.value)}
      error={true && error && warning}
      label={label}
      placeholder={placeholder}
    />
    <Form.Field>
      {true &&
        ((error && <i style={{ color: '#9f3a38', fontWeight: 'bold' }}>{error}</i>) ||
          (warning && <i style={{ color: '#e07407', fontWeight: 'bold' }}>{warning}</i>))}
    </Form.Field>
  </Form.Field>
);
//-------------------------------------------------------------------------------------------------

export default MultiSelectDropdown;
