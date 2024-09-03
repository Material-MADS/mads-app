/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2024
// ________________________________________________________________________________________________
// Authors: Philippe Gantzer (Component Developer) [2024-]
//          Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Descriptors' View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'DescriptorsForm' opens a customized form for the 'Descriptors' component and allows
//        the user to edit its parameters in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components,
//             Internal Serverside API access
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useRef } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Button, Confirm, Form, Modal } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';
import ModelNameForm from './ModelNameForm';

import api from '../../api';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const getDropdownOptions = (list) =>
  list.map((i) => ({ key: i, text: i, value: i }));
//=======================

//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================

//=======================
const validate = (values) => {
  const errors = {};
  if (!values.featureColumns || values.featureColumns=="") {
    errors.featureColumns = 'Required';
  }
  if (!values.targetColumn || values.targetColumn=="") {
    errors.targetColumn = 'Required';
  }

  setSubmitButtonDisable(errors.featureColumns || errors.targetColumn);

  return errors;
};
//=======================
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const DescriptorsForm = (props) => {
  // parameters and such
  const {
    handleSubmit,
    initialValues,
    pristine,
    reset,
    submitting,
    invalid,
    columns,
    targetId,
    colorTags,
    isLoggedIn,
  } = props;
  const cTags = colorTags.map((c) => ({
    text: c.color,
    value: c.id,
    props: { style: '' },
  }));

  const methods = ['Circus', 'Morgan_fingerprints', 'Morgan_features',
                   'RDKit_Fingerprints', 'RDKit_Linear_Fingerprints', 'Layered', 'Avalon',
                   'Torsion', 'Atom_Pairs', 'Linear_fragments', 'Mordred_2D'];
  const methodsArgs = {
    Circus: [
      { name: 'Lower', defVal: 0 },
      { name: 'Upper', defVal: 4 }
    ],
    Morgan_fingerprints: [
      { name: '#Bits', defVal: 1024 },
      { name: 'Radius', defVal: 2 }
    ],
    Morgan_features: [
      { name: '#Bits', defVal: 1024 },
      { name: 'Radius', defVal: 2 }
    ],
    RDKit_Fingerprints: [
      { name: '#Bits', defVal: 1024 },
      { name: 'Radius', defVal: 3 }
    ],
    RDKit_Linear_Fingerprints: [
      { name: '#Bits', defVal: 1024 },
      { name: 'Radius', defVal: 3 }
    ],
    Layered: [
      { name: '#Bits', defVal: 1024 },
      { name: 'Radius', defVal: 3 }
    ],
    Avalon: [
      { name: '#Bits', defVal: 1024 },
    ],
    Torsion: [
      { name: '#Bits', defVal: 1024 },
    ],
    Atom_Pairs: [
      { name: '#Bits', defVal: 1024 },
    ],
    Linear_fragments: [
      { name: 'Lower', defVal: 2 },
      { name: 'Upper', defVal: 5 }
    ],
    Mordred_2D: [],
  };

  // input managers
  const formElement = useRef(null);

  const [currentMethodVal, setValue] = useState(
    initialValues.method
  );

  const onMethodChange = (event) => {
    setValue(event);
    if(event != "Mordred_2D"){
      props.change('methodArguments.arg1', methodsArgs[event][0].defVal);
      if(event != "Avalon" && event != "Torsion" && event != "Atom_Pairs"){
        props.change('methodArguments.arg2', methodsArgs[event][1].defVal);
      }
    }
    else{
      props.change('methodArguments.arg1', initialValues.methodArguments.arg1);
      props.change('methodArguments.arg2', initialValues.methodArguments.arg2);
    }
  };


  // The form itself, as being displayed in the DOM
  return (
    <>
      <Form onSubmit={handleSubmit} ref={formElement}>
        <h4>Descriptors</h4>
        <Form.Field>
          <label>SMILES column(s)</label>
          <Field
            name="featureColumns"
            component={MultiSelectDropdown}
            placeholder="Column(s) encoding structures by SMILES"
            search
            options={columns}
          />
        </Form.Field>

        <Form.Field>
          <label>Descriptors type</label>
          <Field
            name="method"
            component={SemanticDropdown}
            placeholder="Descriptors type"
            search
            options={getDropdownOptions(methods)}
            onChange={onMethodChange}
          />
        </Form.Field>

        {(currentMethodVal != 'Mordred_2D') && <div>
          <Form.Group widths="equal" style={{paddingTop: "6px"}}>
            <Form.Field>
              <label>{methodsArgs[currentMethodVal][0].name}</label>
              <Field
                name="methodArguments.arg1"
                component="input"
                type="number"
              />
            </Form.Field>
            {(currentMethodVal != 'Avalon' && currentMethodVal != 'Torsion' && currentMethodVal != 'Atom_Pairs') && <Form.Field>
            <label>{methodsArgs[currentMethodVal][1].name}</label>
              <Field
                name="methodArguments.arg2"
                component="input"
                type="number"
              />
            </Form.Field>}
          </Form.Group>
        </div>}

        <Form.Field>
          <label>Numerical column(s)</label>
          <Field
            name="numericalFeatureColumns"
            component={MultiSelectDropdown}
            placeholder="(Optional) Numerical column(s) directly encoding features"
            search
            options={columns}
          />
        </Form.Field>

        <Form.Field>
          <label>Solvent column</label>
          <Field
            name="solventColumn"
            component={SemanticDropdown}
            placeholder="(Optional) Column containing solvent name for solvent features calculation."
            search
            clearable
            options={columns}
          />
        </Form.Field>

        <hr />
        <h4>Modeling</h4>
        <Form.Field>
          <label>Property/Target column</label>
          <Field
            name="targetColumn"
            component={SemanticDropdown}
            placeholder="Column"
            search
            options={columns}
          />
        </Form.Field>

        <hr />
        <h4>Component aspect</h4>

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
    </>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------

//=======================
const DescriptorsFormWrapped = reduxForm({
  form: 'descriptors',
  validate,
})(DescriptorsForm);
//=======================

//=======================
const mapDispatchToProps = (dispatch) => ({
  dispatch,
});
//=======================

//-------------------------------------------------------------------------------------------------

export default DescriptorsFormWrapped;
