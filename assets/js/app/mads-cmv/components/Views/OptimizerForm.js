/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Pie' View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'PieForm' opens a customized form for the 'PieChart' visualization component and allows
//        the user to edit its look, feel and behavior in multiple ways.
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
import Checkbox from '../FormFields/Checkbox';
import ModelNameForm from './ModelNameForm';

import api from '../../api';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------
let confirmResolve = null;

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
  if (!values.featureColumns) {
    errors.featureColumns = 'Required';
  }
  if (!values.targetColumn) {
    errors.targetColumn = 'Required';
  }

  setSubmitButtonDisable( errors.featureColumns || errors.targetColumn );

  return errors;
};
//=======================
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const OptimizerForm = (props) => {
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

  const methods = ['Circus', 'Circus2', 'Morgan_fingerprints', 'Morgan_features',
                   'RDKit_Fingerprints', 'RDKit_Linear_Fingerprints', 'Layered', 'Avalon',
                   'Torsion', 'Atom_Pairs', 'Linear_fragments', 'Mordred_2D'];
  const methodsArgs = {
    Circus: [
      { name: 'Lower', defVal: 0 },
      { name: 'Upper', defVal: 4 }
    ],
    Circus2: [
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

  const MLmethods = ['SVR', 'RFR']; // ['SVR', 'RFR', 'XGBR'];
  const cvMethodsArgs = {
    TrainTestSplit: { name: 'test_size', defVal: 0.2 },
    KFold: { name: 'n_splits', defVal: 5 },
  };

//  const isModelBuild = !elem

  // input managers
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formElement = useRef(null);
  const saveForm = useRef(null);

  const showSaveDialog = () => {
    setSaveDialogOpen(true);
  };

  const closeSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  const onSaveModelClick = (event) => {
    event.preventDefault();
    showSaveDialog();
  };

  const confirm = () => {
    const promise = new Promise((resolve, reject) => {
      setConfirmOpen(true);
      confirmResolve = resolve;
    });

    return promise;
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (confirmResolve) {
      confirmResolve(true);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    if (confirmResolve) {
      confirmResolve(false);
    }
  };

  const handleSaveFormSubmit = async (values) => {
    const { onModelSave } = props;

    const res = await api.prediction.fetchOwnedModels();
    const ownedModels = res.data;

    const pre = ownedModels.find((w) => w.name === values.name);
    if (pre) {
      // 'A workspace with the same name is existing. Do you want to overwrite it?'
      const response = await confirm();

      if (response) {
        // overwrite the existing workspace
        if (onModelSave) {
          onModelSave(values.name, true, pre.id);
        }
        return true;
      }

      // do nothing go back to the dialog
      return false;
    }

    if (onModelSave) {
      onModelSave(values.name, false);
    }
    return true;
  };

  const onSaveClick = async () => {
    const result = await saveForm.current.submit();
    if (result) {
      closeSaveDialog();
    }
  };

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

        <Form.Field>
          <label>ML algorithm</label>
          <Field
            name="MLmethod"
            component={SemanticDropdown}
            placeholder="Machine Learning Method"
            search
            options={getDropdownOptions(MLmethods)}
          />
        </Form.Field>

        <Form.Group widths="equal" style={{paddingTop: "6px"}}>
          <Form.Field>
            <label>#CV splits</label>
            <Field
              name="CVsplits"
              component="input"
              type="number"
            />
          </Form.Field>
          <Form.Field>
            <label>#CV repeats</label>
            <Field
              name="CVrepeats"
              component="input"
              type="number"
            />
          </Form.Field>
          <Form.Field>
            <label>#Trials</label>
            <Field
              name="trials"
              component="input"
              type="number"
            />
          </Form.Field>
        </Form.Group>


        <hr />
        <h4>Prediction</h4>
        <p>You can set a part of the data as external prediction set. In this case, this data will not be used to build the model,
           but rather be predicted with the optimized, then rebuild, model.</p>
        <Form.Group widths="equal">
          <Form.Field>
            <Field
              name="external_validation"
              component={Checkbox}
              label="Use data for external validation"
            />
          </Form.Field>

          <Field
            fluid
            name="external_validation_from"
            component="input"
            type="number"
            placeholder="Use data from line #"
          />
        </Form.Group>

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

        <hr />
        <h4>Save model</h4>
        <p>This option allows to save a model (re)built with the parameters of the best model obtained by the optimizer.
        Model optimization should be run once before being able to be saved.</p>

        <Button
          color="blue"
          disabled={invalid || !isLoggedIn}
          onClick={onSaveModelClick}
        >
          Save model
        </Button>
      </Form>

      <Modal open={saveDialogOpen} onClose={closeSaveDialog}>
        <Modal.Header>Save Model</Modal.Header>
        <Modal.Content>
          <ModelNameForm
            ref={saveForm}
            onSubmit={handleSaveFormSubmit}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => closeSaveDialog()}>
            Cancel
          </Button>
          <Button positive content="Save" onClick={onSaveClick} />
        </Modal.Actions>
      </Modal>

      <Confirm
        open={confirmOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        content="A model with the same name is existing. Do you want to overwrite it?"
      />
    </>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------

//=======================
const OptimizerFormWrapped = reduxForm({
  form: 'optimizer',
  validate,
})(OptimizerForm);
//=======================

//=======================
const mapDispatchToProps = (dispatch) => ({
  dispatch,
});
//=======================

//-------------------------------------------------------------------------------------------------

export default OptimizerFormWrapped;
