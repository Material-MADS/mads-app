import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'semantic-ui-react';

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

export default SemanticInput;
