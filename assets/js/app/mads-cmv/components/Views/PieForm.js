import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form } from 'semantic-ui-react';

import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';
import SemCheckbox from '../FormFields/Checkbox';
import SemanticDropdown from '../FormFields/Dropdown';
import $ from 'jquery'

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";
//import * as gPalette from 'google-palette';
import { cmMax, colorMapOptions } from './FormUtils';


const required = (value, values, props) => {
    if(value && !props.columns.some(e => e.value === value)){
      value = undefined;
    }
    if (value == undefined) {
      $("div[name*='targetColumn']" ).find('div:contains("Columns")').css('color', '#d3d3d3');
      $(".ui.positive.button").prop('disabled', true);
      return 'Required';
    }
    else{
      $(".ui.positive.button").prop('disabled', false);
      return;
    }
}

const tooBig = (value, values) => {
  if (value && (parseInt(value) > parseInt(cmMax[values.options.colorMap].replace(/[^0-9a-z]/gi, '')))) {
    return 'The color map below does not have enough colors for your requested bins, so we might be forced to pick another for you when drawing the chart...';
  }
  return;
}

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

  const [currentCMVal, setValue] = useState(
    initialValues.options.colorMap
  );

  const onCMChange = (event) => {
    setValue(event);
  };

  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Target column</label>
        <Field
          name="targetColumn"
          component={SemanticDropdown}
          placeholder="Columns"
          validate={[ required ]}
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Number of bins (Automatically ALL for text data) (For numerical data, pick 0 for ALL)</label>
        <Field
           name="bins"
           component={inputTrad}
           type="number"
           placeholder="bins"
           warn={[ tooBig ]}
           parse={(value) => Number(value)}
        />
      </Form.Field>

      <Form.Field>
        <label>Include undefined values</label>
        <Field
          name="undefinedIsIncluded"
          component={SemCheckbox}
          toggle
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
          label="Width"
        />
        <Field
          fluid
          name="options.extent.height"
          component={Input}
          placeholder="Height"
          label="Height"
        />
      </Form.Group>

      <Form.Field>
        <label>Color Palette (if number of bins exceed number of colors available in the palette, default palette will be used)</label>
        <Field
          name="options.colorMap"
          component={SemanticDropdown}
          placeholder="Color Map"
          options={colorMapOptions}
          onChange={onCMChange}
        />
      </Form.Field>
      <div>
        {(cmMax[currentCMVal] == "256") ? allPal[currentCMVal+cmMax[currentCMVal]].map((color, index) => (
           <span key={color.toString()+"_"+index} style={{display: 'inline-block', width: '2px', height: '20px', backgroundColor: ("#"+color.toString(16).slice(0, -2).padStart(6, '0'))}}></span>
        )) : allPal[currentCMVal+cmMax[currentCMVal]].map((color, index) => (
           <div key={color.toString()+"_"+index} style={{display: 'inline-block', width: '20px', height: '20px', backgroundColor: ("#"+color.toString(16).slice(0, -2).padStart(6, '0'))}}></div>
        ))}
        <div style={{padingLeft: 10}}>(Max Colors: {cmMax[currentCMVal].replace(/[^0-9a-z]/gi, '')})</div>
      </div>
    </Form>
  );
};

export default reduxForm({
  form: 'Pie',
})(PieForm);
