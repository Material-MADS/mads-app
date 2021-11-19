import React, { useState } from 'react';
import { Field, reduxForm, Label } from 'redux-form';
import { Button, Form } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import SemCheckbox from '../FormFields/Checkbox';
import Input from '../FormFields/Input';
import _ from 'lodash';

import * as chroma from 'chroma-js';
import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";
// import { cmMax, colorMapOptions } from './FormUtils';


const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}

const errors = {};
const errorValidate = (value, values, props, fieldName) => {
  let error = undefined;

  //Is required
  if (fieldName == 'featureColumns'){
    if((!value || _.isEmpty(value) || value.length < 2) && !values.selectAllColumns){
      error = 'At least two columns Required';
    }
    else { errors[fieldName] = false; }
  }

  if (fieldName == 'selectAllColumns'){
    if(values.selectAllColumns){
      values.featureColumns = undefined;
    }
  }

  errors[fieldName] = (error != undefined);
  setSubmitButtonDisable((Object.values(errors)).includes(true));

  return error;
}


const PairwiseCorrelationForm = (props) => {
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

  let dataCols = columns.filter(col => col.key != 'index');

  const [selectAllColumns, setSelectAllColumns] = useState(
    !initialValues.selectAllColumns
  );

  const [colorRange, setSelectColorRange] = useState(
    !initialValues.colorRange
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group widths="equal">
        <Form.Field>
          <label>Feature columns</label>
          <Field
            name="featureColumns"
            component={MultiSelectDropdown}
            placeholder="Columns"
            options={dataCols}
            disabled={!selectAllColumns}
            validate={[ errorValidate ]}
          />
        </Form.Field>
        <Form.Field>
          <label>Select All Columns:</label>
          <Field
            name="selectAllColumns"
            component={SemCheckbox}
            toggle
            onChange={(e, data) => {
              setSelectAllColumns(!data);
            }}
            validate={[ errorValidate ]}
          />
        </Form.Field>
      </Form.Group>

      <hr />
        <Form.Field>
          <label>Enable Half-Mask:</label>
          <Field
            name="options.maskEnabled"
            component={SemCheckbox}
            toggle
          />
        </Form.Field>

      <hr />
      <Form.Group widths="equal">
        <Form.Field>
          <div>
            {(chroma.scale(["#3B4CC0", "white", "#B40426"]).domain([-1, 0, 1]).colors(100)).map((color, index) => (
              <span key={color.toString()+"_"+index} style={{display: 'inline-block', width: '2px', height: '20px', backgroundColor: color}}></span>
            ))}
          </div>
        </Form.Field>
        <Form.Field>
          <label>Select Color Range:</label>
          <Field
            name="colorRange"
            component={SemCheckbox}
            toggle
            onChange={(e, data) => {
              setSelectColorRange(!data);
            }}
          />
        </Form.Field>
        <Form.Field>
          <div>
            {(allPal['RdYlBu11']).map((color, index) => (
              // <span key={color.toString()+"_"+index} style={{display: 'inline-block', width: '2px', height: '20px', backgroundColor: ("#"+color.toString(16).slice(0, -2).padStart(6, '0'))}}></span>
              <div key={color.toString()+"_"+index} style={{display: 'inline-block', width: '10px', height: '20px', backgroundColor: ("#"+color.toString(16).slice(0, -2).padStart(6, '0'))}}></div>
            ))}
          </div>
        </Form.Field>
      </Form.Group>

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
  form: 'PairwiseCorrelation',
})(PairwiseCorrelationForm);
