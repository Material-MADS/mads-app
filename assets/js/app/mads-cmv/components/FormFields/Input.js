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
}) => (
  <Form.Field>
    <Input
      {...input}
      {...props}
      onBlur={() => input.onBlur()}
      value={input.value}
      onChange={(param, data) => input.onChange(data.value)}
      error={touched && error && true}
      label={label}
      placeholder={placeholder}
    />
    <Form.Field>
      {touched &&
        ((error && <i style={{ color: '#9f3a38' }}>{error}</i>) ||
          (warning && <i style={{ color: '#9f3a38' }}>{warning}</i>))}
    </Form.Field>
  </Form.Field>
);

export default SemanticInput;
