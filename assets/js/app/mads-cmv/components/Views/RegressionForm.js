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

//*** TODO: This is not fully structured the same way as other Views, should probably be adjusted to do that

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
  if (values.featureColumns && values.featureColumns.length === 0) {
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
const RegressionForm = (props) => {
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

  const methods = ['Linear', 'Lasso', 'SVR', 'RandomForest', 'ExtraTrees', 'MLP', 'KernelRidge'];
  const methodsArgs = {
    Linear: [],
    Lasso: [],
    SVR: [
      { name: 'C', defVal: 1.0 },
      { name: 'gamma', defVal: 0.1 }
    ],
    RandomForest: [
      { name: 'random_state', defVal: 0 },
      { name: 'n_estimators', defVal: 100 }
    ],
    ExtraTrees: [
      { name: 'random_state', defVal: 0 },
      { name: 'n_estimators', defVal: 100 }
    ],
    MLP: [
      { name: 'random_state', defVal: 1 },
      { name: 'max_iter', defVal: 500 }
    ],
    KernelRidge: [
      { name: 'alpha', defVal: 1.0 },
    ],
  };

  const cvMethods = ['TrainTestSplit', 'KFold'];
  const cvMethodsArgs = {
    TrainTestSplit: { name: 'test_size', defVal: 0.2 },
    KFold: { name: 'n_splits', defVal: 5 },
  };

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
    if(event != "Linear" && event != "Lasso"){
      props.change('methodArguments.arg1', methodsArgs[event][0].defVal);
      if(event != "KernelRidge"){
        props.change('methodArguments.arg2', methodsArgs[event][1].defVal);
      }
      else{
        props.change('methodArguments.arg2', initialValues.methodArguments.arg2);
      }
    }
    else{
      props.change('methodArguments.arg1', initialValues.methodArguments.arg1);
      props.change('methodArguments.arg2', initialValues.methodArguments.arg2);
    }
  };

  const [currentCVMethodVal, setCVValue] = useState(
    initialValues.cvmethod
  );

  const onCVMethodChange = (event) => {
    setCVValue(event);
    props.change('cvmethodArg', cvMethodsArgs[event].defVal);
    if(event == "TrainTestSplit" || event == "KFold"){
      props.change('cvmethodArg', cvMethodsArgs[event].defVal);
    }
    else{
      props.change('cvmethodArg', initialValues.cvmethodArg);
    }
  };


  // The form itself, as being displayed in the DOM
  return (
    <>
      <Form onSubmit={handleSubmit} ref={formElement}>
        <Form.Field>
          <label>Method:</label>
          <Field
            name="method"
            component={SemanticDropdown}
            placeholder="Method"
            search
            options={getDropdownOptions(methods)}
            onChange={onMethodChange}
          />
        </Form.Field>

        <Form.Field>
          <label>Feature columns</label>
          <Field
            name="featureColumns"
            component={MultiSelectDropdown}
            placeholder="Columns"
            search
            options={columns}
          />
        </Form.Field>

        <Form.Field>
          <label>Target column</label>
          <Field
            name="targetColumn"
            component={SemanticDropdown}
            placeholder="Column"
            search
            options={columns}
          />
        </Form.Field>

        {(currentMethodVal != 'Linear' && currentMethodVal != 'Lasso') && <div>
          <label style={{fontWeight: "bold", textDecoration: "underline"}}>{currentMethodVal} Parameters:</label>
          <Form.Group widths="equal" style={{paddingTop: "6px"}}>
            <Form.Field>
              <label>{methodsArgs[currentMethodVal][0].name}:</label>
              <Field
                name="methodArguments.arg1"
                component="input"
                type="number"
              />
            </Form.Field>
            {(currentMethodVal != 'KernelRidge') && <Form.Field>
            <label>{methodsArgs[currentMethodVal][1].name}:</label>
              <Field
                name="methodArguments.arg2"
                component="input"
                type="number"
              />
            </Form.Field>}
          </Form.Group>
        </div>}

        <hr></hr>

        <h4>Cross Validation:</h4>
        <Form.Field>
          <label>CV Method:</label>
          <Field
            name="cvmethod"
            component={SemanticDropdown}
            placeholder="CV Method"
            search
            options={getDropdownOptions(cvMethods)}
            onChange={onCVMethodChange}
          />
        </Form.Field>

        <Form.Field>
          <label>{cvMethodsArgs[currentCVMethodVal]?cvMethodsArgs[currentCVMethodVal].name:'0.2'}:</label>
          <Field
            name="cvmethodArg"
            component="input"
            type="number"
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
const RegressionFormWrapped = reduxForm({
  form: 'regression',
  validate,
})(RegressionForm);
//=======================

//=======================
const mapDispatchToProps = (dispatch) => ({
  dispatch,
});
//=======================

//-------------------------------------------------------------------------------------------------

export default RegressionFormWrapped;
