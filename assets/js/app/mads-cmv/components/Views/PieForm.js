import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import Input from '../FormFields/Input';
import SemanticDropdown from '../FormFields/Dropdown';

const PieForm = (props) => {
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
        <label>Target columns</label>
        <Field
          name="targetColumns[0]"
          component={SemanticDropdown}
          placeholder="Columns"
          search
          // trigger={<Label color={data.color}/>}
          options={columns}
        />
      </Form.Field>
      <Form.Field>
        <label>Number of bins</label>
        <Field
          name="bins"
          component="input"
          type="number"
          placeholder="bins"
          parse={(value) => Number(value)}
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
  form: 'Pie',
})(PieForm);
