import React, { useState } from 'react';
import { Field, reduxForm, Label } from 'redux-form';
import { Button, Form } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import SemCheckbox from '../FormFields/Checkbox';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';
import TextArea from '../FormFields/TextArea';
import _ from 'lodash';


const Molecule3DForm = (props) => {
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

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group widths="equal">
        <Form.Field>
          <label>Background Color:</label>
          <Field
            fluid
            name="options.bkgCol"
            component={inputTrad}
            type="color"
          />
        </Form.Field>
        <Form.Field>
          <label>Text Color:</label>
          <Field
            fluid
            name="options.txtCol"
            component={inputTrad}
            type="color"
          />
        </Form.Field>
      </Form.Group>

      <hr />

      <Form.Field>
        <label>MOL File String:</label>
        <Field
          fluid
          name="molStr"
          component={TextArea}
          type="color"
          placeholder="CT1000292221
            3  2  0  0  0               999 V2000
              0.0021   -0.0041    0.0020 H   0  0  0  0  0  0  0  0  0  0  0  0
            -0.0110    0.9628    0.0073 O   0  0  0  0  0  0  0  0  0  0  0  0
              0.8669    1.3681    0.0011 H   0  0  0  0  0  0  0  0  0  0  0  0
            1  2  1  0  0  0  0
            2  3  1  0  0  0  0
          M  END
          "
        />
      </Form.Field>
      {/* validate={[ errorValidate ]} onChange={onCMChange}*/}
      <Form.Field>
        <label>Chemical Name:</label>
        <Field
          fluid
          name="molName"
          component={Input}
          placeholder="Water"
        />
      </Form.Field>

      <Form.Field>
        <label>Chemical Formula:</label>
        <Field
          fluid
          name="molForm"
          component={Input}
          placeholder="H2O"
        />
      </Form.Field>

      <Form.Field>
        <label>Further Details URL:</label>
        <Field
          fluid
          name="molUrl"
          component={Input}
          placeholder="https://www.molinstincts.com/sdf-mol-file/water-sdf-CT1000292221.html"
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
        />
        <Field
          fluid
          name="options.extent.height"
          component={Input}
          placeholder="Height"
        />
      </Form.Group>

    </Form>
  );
};

export default reduxForm({
  form: 'Molecule3D',
})(Molecule3DForm);
