import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import SemCheckbox from '../FormFields/Checkbox';
import Input from '../FormFields/Input';

// console.warn(MultiSelectDropdown);

const ClusteringForm = (props) => {
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

  const methods = ['KMeans', 'GMM'];

  const getDropdownOptions = (list) =>
    list.map((i) => ({ key: i, text: i, value: i }));

  return (
    <Form onSubmit={handleSubmit}>
      {/* <Form.Field>
        <label>Filter</label>
        <Field
          name="filter"
          component={MultiSelectDropdown}
          placeholder="ColorTags"
          search
          // trigger={<Label color={data.color}/>}
          options={cTags}
        />
      </Form.Field> */}

      <Form.Field>
        <label>Method:</label>
        <Field
          name="method"
          component={SemanticDropdown}
          placeholder="Method"
          search
          options={getDropdownOptions(methods)}
        />
      </Form.Field>
      <Form.Field>
        <label>Number of clusters</label>
        <Field
          name="numberOfClusters"
          component="input"
          type="number"
          placeholder="bins"
          parse={(value) => Number(value)}
        />
      </Form.Field>
      <Form.Field>
        <label>Feature columns</label>
        <Field
          name="featureColumns"
          component={MultiSelectDropdown}
          placeholder="Columns"
          search
          // trigger={<Label color={data.color}/>}
          options={columns}
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
  form: 'clustering',
})(ClusteringForm);
