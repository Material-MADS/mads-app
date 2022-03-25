/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Classficiation' View,
--              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'ClassficiationForm' opens a customized form for a 'Classficiation' view of a type
//        of Scatter and Line chart visualization component and allows the user to edit its look,
//        feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components,
//             Internal Serverside API access
=================================================================================================*/

//*** TODO: Convert this to have the same look and feel to the code as other forms...
//*** TODO: Could this be deleted, and just leave the Scatter Plot with some new settings to replace them

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
// Form Initiation Values
//-------------------------------------------------------------------------------------------------

//=======================
const getDropdownOptions = (list) =>
  list.map((i) => ({ key: i, text: i, value: i }));
//=======================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------

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

  return errors;
};
//=======================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const ClassificationForm = (props) => {

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

  const methods = ['RandomForest', 'SVC', 'ExtraTrees', 'GradientBoosting', 'KNeighbors', 'SGD', 'MLP', 'Ridge'];
  const methodsArgs = {
    RandomForest: [
      { name: 'random_state', defVal: 0 },
      { name: 'n_estimators', defVal: 100 }
    ],
    SVC: [
      { name: 'C', defVal: 1.0 },
      { name: 'gamma', defVal: 0.1 }
    ],
    ExtraTrees: [
      { name: 'random_state', defVal: 0 },
      { name: 'n_estimators', defVal: 100 }
    ],
    GradientBoosting: [],
    KNeighbors: [],
    SGD: [],
    MLP: [
      { name: 'random_state', defVal: 1 },
      { name: 'max_iter', defVal: 500 }
    ],
    Ridge: [
      { name: 'alpha', defVal: 1.0 },
    ],
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
    if(event != "GradientBoosting" && event != "KNeighbors" && event != "SGD"){
      props.change('methodArguments.arg1', methodsArgs[event][0].defVal);
      if(event != "Ridge"){
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

  // The form itself, as being displayed in the DOM
  return (
    <>
      <Form onSubmit={handleSubmit} ref={formElement}>
        <Form.Field>
          <label>Filter</label>
          <Field
            name="filter"
            component={MultiSelectDropdown}
            placeholder="ColorTags"
            search
            options={cTags}
          />
        </Form.Field>

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

        {(currentMethodVal != 'GradientBoosting' && currentMethodVal != 'KNeighbors' && currentMethodVal != 'SGD') && <div>
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
            {(currentMethodVal != 'Ridge') && <Form.Field>
            <label>{methodsArgs[currentMethodVal][1].name}:</label>
              <Field
                name="methodArguments.arg2"
                component="input"
                type="number"
              />
            </Form.Field>}
          </Form.Group>
        </div>}

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
export default reduxForm({
  form: 'classification',
  validate,
})(ClassificationForm);
//-------------------------------------------------------------------------------------------------
