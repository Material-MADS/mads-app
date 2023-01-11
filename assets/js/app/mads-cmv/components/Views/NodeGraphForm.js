/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'NodeGraph' View,
//              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'NodeGraphForm' opens a customized form for the 'NodeGraph' visualization component
//        and allows the user to edit its look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             lodash libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm, Label, change } from 'redux-form';
import { Form, Popup } from 'semantic-ui-react';

import Input from '../FormFields/Input';
import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import inputTrad from '../FormFields/inputTraditional';
import SemCheckbox from '../FormFields/Checkbox';

import _ from 'lodash';

import noImg from '../VisComponents/images/noimage.jpg';

import { getDropdownOptions } from './FormUtils';

//-------------------------------------------------------------------------------------------------
var nodeShapeTypes = ["Square", "Circle", "Image"];

//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================

//=======================
const errors = {};
const errorValidate = (value, values, props, fieldName) => {
  let error = undefined;

  // Make sure the correct dataset is loaded
  const testColumn1 = values.sourceNodeColumn;
  if(testColumn1 && !props.columns.some(e => e.value === testColumn1)){
    if(values.sourceNodeColumn){ values.sourceNodeColumn = undefined; }
    if(values.targetNodeColumn){ values.targetNodeColumn = undefined; }
    if(values.linkWeightColumn){ values.linkWeightColumn = undefined; }
  }

  //Is required
  if ((values.sourceNodeColumn || values.targetNodeColumn)){
    if(!value || _.isEmpty(value)){
      error = 'Required';
    }
    else { errors[fieldName] = false; }
  }

  errors[fieldName] = (error != undefined);
  setSubmitButtonDisable(!value || error || (Object.values(errors)).includes(true));

  return error;
}
//=======================
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const NodeGraphForm = (props) => {
  // parameters and such
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

  if(!initialValues.options.links.baseLength){ initialValues.options.links.baseLength = 15.0 };
  if(!initialValues.options.links.minLength){ initialValues.options.links.minLength = 5.0 };
  if(!initialValues.options.links.staticColor){ initialValues.options.links.staticColor = '#000000' };
  if(!initialValues.options.links.opacity){ initialValues.options.links.opacity = 0.7 };
  if(!initialValues.options.links.bezierCurveEnabled){ initialValues.options.links.bezierCurveEnabled = false };
  const [bzCurveEnabled, setBzCurveEnabled] = useState( initialValues.options.links.bezierCurveEnabled );
  const onBzCurveEnabledChange = (event) => { setBzCurveEnabled(event); };

  if(!initialValues.options.graphLayout.springCoeff){ initialValues.options.graphLayout.springCoeff = 0.0005 };
  if(!initialValues.options.graphLayout.dragCoeff){ initialValues.options.graphLayout.dragCoeff = 0.02 };
  if(!initialValues.options.graphLayout.gravity){ initialValues.options.graphLayout.gravity = -1.2 };
  if(!initialValues.options.graphLayout.theta){ initialValues.options.graphLayout.theta = 1.0 };
  if(!initialValues.options.graphLayout.timeStep){ initialValues.options.graphLayout.timeStep = 20 };

  if(!initialValues.options.nodes.staticColor){ initialValues.options.nodes.staticColor = '#00a1ee' };
  if(!initialValues.options.nodes.staticSize){ initialValues.options.nodes.staticSize = 10 };
  if(!initialValues.options.nodes.colorGradeEnabled){ initialValues.options.nodes.colorGradeEnabled = false };
  if(!initialValues.options.nodes.sizeGradeEnabled){ initialValues.options.nodes.sizeGradeEnabled = false };
  if(!initialValues.options.nodes.opacity){ initialValues.options.nodes.opacity = 1.0 };
  if(!initialValues.options.nodes.shapeType){ initialValues.options.nodes.shapeType = "Square" };
  if(!initialValues.options.nodes.roundShapeBorderEnabled){ initialValues.options.nodes.roundShapeBorderEnabled = false };
  if(!initialValues.options.nodes.imgShapeImgURL){ initialValues.options.nodes.imgShapeImgURL = noImg };


  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Source Node Column</label>
        <Field
          name="sourceNodeColumn"
          component={SemanticDropdown}
          placeholder="Source (Main) Node Column"
          options={columns}
          validate={[ errorValidate ]}
        />
      </Form.Field>

      <Form.Field>
        <label>Target Node Column</label>
        <Field
          name="targetNodeColumn"
          component={SemanticDropdown}
          placeholder="Target Node Column"
          options={columns}
          validate={[ errorValidate ]}
        />
      </Form.Field>

      <Form.Field>
        <label>Link/Edge Weight Column</label>
        <Field
          name="linkWeightColumn"
          component={SemanticDropdown}
          placeholder="Link Weight"
          options={getDropdownOptions(columns, true)}
        />
      </Form.Field>

      <hr />

      <Form.Group widths="equal">
        <label>Link Settings:</label>
        <Form.Field>
          <label>Base Length <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content="Link Base Length without any weights" size='small' />:</label>
          <Field
            fluid
            name="options.links.baseLength"
            component={inputTrad}
            type="number"
            step={1.0}
          />
        </Form.Field>
        <Form.Field>
          <label>Min Length <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content="Link Minimum Length when weights are applied (Higher Weight = Shorter Link)" size='small' />:</label>
          <Field
            fluid
            name="options.links.minLength"
            component={inputTrad}
            type="number"
            step={1.0}
          />
        </Form.Field>
        <Form.Field>
          <label>Static Color:</label>
          <Field
            fluid
            name="options.links.staticColor"
            component={inputTrad}
            disabled={bzCurveEnabled}
            type="color"
          />
        </Form.Field>
        <Form.Field>
          <label>Opacity:</label>
          <Field
            fluid
            name="options.links.opacity"
            component={inputTrad}
            type="number"
            step={0.1}
            min={0}
            max={1}
          />
        </Form.Field>
        <Form.Field>
          <label>Bezier Curve Enabled <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content="Curved links are permanent blue and will not be affected by the static color settings" size='small' />:</label>
          <Field
            name="options.links.bezierCurveEnabled"
            component={SemCheckbox}
            toggle
            onChange={onBzCurveEnabledChange}
          />
        </Form.Field>
      </Form.Group>

      <hr />

      <Form.Group widths="equal">
        <label>Layout:</label>
        <Form.Field>
          <label>SpringCoeff <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content="Hook's law coefficient. 1 = solid spring." size='small' />:</label>
          <Field
            fluid
            name="options.graphLayout.springCoeff"
            component={inputTrad}
            type="number"
            step={0.0001}
            min={0}
            max={1}
          />
        </Form.Field>
        <Form.Field>
          <label>DragCoeff <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content="Drag force coefficient. Used to slow down system, thus should be less than 1. The closer it is to 0 the less tight system will be." size='small' />:</label>
          <Field
            fluid
            name="options.graphLayout.dragCoeff"
            component={inputTrad}
            type="number"
            step={0.005}
            min={0}
            max={1}
          />
        </Form.Field>
        <Form.Field>
          <label>Gravity <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content="Coulomb's law coefficient. It's used to repel nodes thus should be negative. If you make it positive, nodes start to attract each other." size='small' />:</label>
          <Field
            fluid
            name="options.graphLayout.gravity"
            component={inputTrad}
            type="number"
            step={0.1}
          />
        </Form.Field>
        <Form.Field>
          <label>Theta <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content="Theta coefficient from Barnes Hut simulation. Ranged between 0-1. The closer it's to 1 the more nodes algorithm will have to go through. Setting it to one makes Barnes Hut simulation no different from brute-force forces calculation (each node is considered)." size='small' />:</label>
          <Field
            fluid
            name="options.graphLayout.theta"
            component={inputTrad}
            type="number"
            step={0.05}
            min={0}
            max={1}
          />
        </Form.Field>
        <Form.Field>
          <label>TimeStep <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content="Default time step (dt) for forces integration." size='small' />:</label>
          <Field
            fluid
            name="options.graphLayout.timeStep"
            component={inputTrad}
            type="number"
            step={1.0}
          />
        </Form.Field>
      </Form.Group>

      <hr />

      <Form.Group widths="equal">
        <label>Node Settings:</label>
        <Form.Field>
          <label>Static Color:</label>
          <Field
            fluid
            name="options.nodes.staticColor"
            component={inputTrad}
            type="color"
          />
        </Form.Field>
        <Form.Field>
          <label>Static Size:</label>
          <Field
            fluid
            name="options.nodes.staticSize"
            component={inputTrad}
            type="number"
            step={1}
            min={5}
          />
        </Form.Field>
        <Form.Field>
          <label>Enable Color Gradience:</label>
          <Field
            name="options.nodes.colorGradeEnabled"
            component={SemCheckbox}
            toggle
          />
        </Form.Field>
        <Form.Field>
          <label>Enable Size Gradience:</label>
          <Field
            name="options.nodes.sizeGradeEnabled"
            component={SemCheckbox}
            toggle
          />
        </Form.Field>
        <Form.Field>
          <label>Opacity:</label>
          <Field
            fluid
            name="options.nodes.opacity"
            component={inputTrad}
            type="number"
            step={0.1}
            min={0}
            max={1}
          />
        </Form.Field>
        <Form.Field>
          <label>Shape Type:</label>
          <Field
            name="options.nodes.shapeType"
            component={SemanticDropdown}
            options={getDropdownOptions(nodeShapeTypes)}
          />
        </Form.Field>
        <Form.Field>
          <label>Round Shape Border Enabled:</label>
          <Field
            name="options.nodes.roundShapeBorderEnabled"
            component={SemCheckbox}
            toggle
          />
        </Form.Field>
        <Form.Field>
          <label>Image Shape Image URL:</label>
          <Field
            fluid
            name="options.nodes.imgShapeImgURL"
            component={inputTrad}
          />
        </Form.Field>
      </Form.Group>

      <hr />

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
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'NodeGraph',
})(NodeGraphForm);
//-------------------------------------------------------------------------------------------------
