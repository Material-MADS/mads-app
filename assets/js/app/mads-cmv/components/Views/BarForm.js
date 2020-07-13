import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Label } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';

const BarForm = (props) => {
  const {
    handleSubmit,
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
        <label>Dimension</label>
        <Field
          name="mappings.dimension"
          component={SemanticDropdown}
          placeholder="Dimension"
          search
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Mesures</label>
        <Field
          name="mappings.measures"
          component={MultiSelectDropdown}
          placeholder="Mesures"
          search
          options={columns}
        />
      </Form.Field>
    </Form>
  );
};

export default reduxForm({
  form: 'Bar',
})(BarForm);
