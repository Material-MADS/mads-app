import React from 'react';
import PropTypes from 'prop-types';
import { Form, Checkbox } from 'semantic-ui-react';

const SemCheckbox = ({
  input,
  type,
  label,
  placeholder,
  meta: { touched, error, warning },
  ...props
}) => (
  <Form.Field>
    <Checkbox
      {...input}
      {...props}
      // defaultChecked={!!input.value || false}
      onBlur={() => input.onBlur()}
      checked={input.value || false}
      onChange={(param, data) => {
        input.onChange(data.checked);
      }}
      // error={touched && error && true}
      label={label}
      placeholder={placeholder}
      value=""
    />
    <Form.Field>
      {touched &&
        ((error && <i style={{ color: '#9f3a38' }}>{error}</i>) ||
          (warning && <i style={{ color: '#9f3a38' }}>{warning}</i>))}
    </Form.Field>
  </Form.Field>
);

export default SemCheckbox;
