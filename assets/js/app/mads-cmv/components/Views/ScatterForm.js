import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import SemCheckbox from '../FormFields/Checkbox';
import Input from '../FormFields/Input';

// console.warn(MultiSelectDropdown);

const ScatterForm = (props) => {
  const {
    handleSubmit,
    initialValues,
    pristine,
    reset,
    submitting,
    columns,
    targetId,
    colorTags,
  } = props;
  const cTags = colorTags.map((c) => ({
    text: c.color,
    value: c.id,
    props: { style: '' },
  }));

  const [colorDisabled, setColorDisabled] = useState(
    !initialValues.colorAssignmentEnabled
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Filter</label>
        <Field
          name="filter"
          component={MultiSelectDropdown}
          placeholder="ColorTags"
          search
          // trigger={<Label color={data.color}/>}
          options={cTags}
        />
      </Form.Field>

      <Form.Field>
        <label>X:</label>
        <Field
          name="mappings.x"
          component={SemanticDropdown}
          placeholder="X"
          search
          options={columns}
        />
      </Form.Field>
      <Form.Field>
        <label>Y:</label>
        <Field
          name="mappings.y"
          component={SemanticDropdown}
          placeholder="Y"
          search
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Color assignment:</label>
        <Field
          name="colorAssignmentEnabled"
          component={SemCheckbox}
          toggle
          onChange={(e, data) => {
            console.log(data);
            setColorDisabled(!data);
          }}
        />
      </Form.Field>

      <Form.Field>
        <label>Color:</label>
        <Field
          name="mappings.color"
          component={SemanticDropdown}
          placeholder="Color"
          search
          options={columns}
          disabled={colorDisabled}
        />
      </Form.Field>

      <hr />
      <Form.Group widths="equal">
        <label>Extent:</label>

        <Field
          fluid
          name="options.extent.width"
          component={Input}
          placeholder="Width"
          // parse={(value) => Number(value)}
        />
        <Field
          fluid
          name="options.extent.height"
          component={Input}
          placeholder="Height"
          // parse={(value) => Number(value)}
        />
      </Form.Group>
    </Form>
  );
};

export default reduxForm({
  form: 'Scatter',
})(ScatterForm);
