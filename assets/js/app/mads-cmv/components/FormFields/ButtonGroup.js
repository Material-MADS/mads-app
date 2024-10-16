/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of the 'ButtonGroup' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'ButtonGroup' is of classic type, look and feel.
//        As the example of ButtonGroup , you can refer to temperature field of MonteCat Component.
// ------------------------------------------------------------------------------------------------
// Importance: If developer use this component, pass 'buttonList' as props.
//------------------------------------------------------------------------------------------------
// References: React, prop-types & semantic-ui-react Libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, ButtonGroup } from 'semantic-ui-react';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The FormField Component
//-------------------------------------------------------------------------------------------------
const SemButtonGroup = ({
  input,
  type,
  label,
  placeholder,
  meta: { touched, error, warning },
  ...props
}) => {
  const [activeButton, setActiveButton] = useState(input.value)
  const {buttonList} = props;

  const handleClick = (value) => {
  setActiveButton(value);
  input.onChange(value);
  }
  return (
    <Form.Field>
      <ButtonGroup>
        {buttonList.map((element, index)=> (
          <Button
            type="button"
            key={index}
            onClick={() => handleClick(element)}
            active={element === activeButton}>{element}</Button>
                ))}
      </ButtonGroup>
      <Form.Field>
        {true &&
          ((error && <i style={{ color: '#9f3a38', fontWeight: 'bold' }}>{error}</i>) ||
            (warning && <i style={{ color: '#e07407', fontWeight: 'bold' }}>{warning}</i>))}
      </Form.Field>
    </Form.Field>
    )
};
//-------------------------------------------------------------------------------------------------

export default SemButtonGroup;
