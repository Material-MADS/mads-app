import React from 'react';
import PropTypes from 'prop-types';
import { Form, Dropdown } from 'semantic-ui-react';

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

export default MultiSelectDropdown;
