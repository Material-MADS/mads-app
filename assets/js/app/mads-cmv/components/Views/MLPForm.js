/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'MLP' View,
//              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'MLP Form' opens a customized form for the
//        'MLP' visualization component and allows the user to edit its look,
//        feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             lodash lib
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Field, reduxForm, Label, change, formValueSelector } from 'redux-form';
import { useSelector } from 'react-redux';

import { Button, Form, Popup, Modal, Confirm, List } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';
import SemCheckbox from '../FormFields/Checkbox';

import { getDropdownOptions } from './FormUtils';
import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import { input } from '@tensorflow/tfjs';
import ModelNameForm from './ModelNameForm';

import _, { initial } from 'lodash';
import api from '../../api';
import { event } from 'jquery';
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const metrics = ['Loss', 'R2', 'True vs Predict'];
const splitMode = ['Train-Val Split', 'Train-Val-Test Split']
//=======================
let confirmResolve = null;
//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else { $(".ui.positive.button").prop('disabled', false); }
}
//=======================


//set errors
//=======================
const validate = (values) => {
  const errors = {};
  if (!values.metric) {
    errors.metric = 'Required';
  }

  if (values.metric != 'True vs Predict') {
    if (!values.splitMode) {
      errors.splitMode = 'Required';
    }
  }

  if (!values.featureColumns) {
    errors.featureColumns = 'Required';
  }

  if (values.featureColumns && values.featureColumns.length === 0) {
    errors.featureColumns = 'Required';
  }

  if (!values.targetColumn) {
    errors.targetColumn = 'Required';
  }

  setSubmitButtonDisable(errors.featureColumns || errors.targetColumn || errors.metric);

  return errors;
};
//=======================


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
// -------------------------------------------------------------------------------------------------
const MLP_Component_Form = forwardRef((props, ref) => {

  // parameters and such
  const {
    handleSubmit,
    initialValues,
    defaultOptions,
    columns,
    input,
    pristine,
    reset,
    submitting,
    colorTags,
    invalid,
    isLoggedIn,
    dirty,
  } = props;


  useImperativeHandle(ref, () => ({
    submit: () => props.handleSubmit() // call handleSubmit(redux-form)
  }));

  const cTags = colorTags.map((c) => ({
    text: c.color,
    value: c.id,
    props: { style: '' },
  }));


  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formElement = useRef(null);
  const saveForm = useRef(null);


  //----------------------------------------------------------------------------------------------------------------------------
  // save button
  const showSaveDialog = () => {
    setSaveDialogOpen(true);
  };

  // cancel button or submit form => close confirm dialog
  const closeSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  const onSaveModelClick = (event) => {
    event.preventDefault();
    showSaveDialog();
  };


  const confirm = () => {
    const promise = new Promise((resolve, reject) => {
      setConfirmOpen(true);                  // A model with the same name is existing. Do you want to overwrite it? dialog OPEN
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

    // 'A workspace with the same name is existing. Do you want to overwrite it?'
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
  //----------------------------------------------------------------------------------------------------------------------------

  const [currentMetricVal, setCurrentMetricVal] = useState(
    initialValues.metric
  );

  const handleMetricVal = (event) => {
    if (!event) return;
    setCurrentMetricVal(event);
    applyDefaults(event);

    if (event === 'True vs Predict') {
      props.change('options.extent.width', 400);
      props.change('options.extent.height', 400);
    } else if (event === 'Loss' || event === 'R2') {
      props.change('options.extent.width', 600);
      props.change('options.extent.height', 400);
    }
  }

  const [currentSplit, setCurrentSplit] = useState(
    initialValues.splitMode
  );

  const handleSplit = (event) => {
    if (!event) return;
    setCurrentSplit(event);
    applyDefaults(event);
  };


  const selector = formValueSelector('MLP_Component');
  const nLayersValue = useSelector(state => selector(state, 'n_layers'));
  const formValues = useSelector(state => state.form.MLP_Component?.values || {});
  const earlyStoppingValue = useSelector(state => selector(state, 'early_stopping'));


  // hidden layers
  const layerChange = Math.max(0, parseInt(nLayersValue, 10) || 0);  // set the number of layers
  const [layerCount, setLayerCount] = useState(0);

  useEffect(() => {
    if (layerChange > layerCount) {
      for (let i = layerCount + 1; i <= layerChange; i++) {
        if (formValues[`layer_${i}`] === undefined) {
          const prevValue = formValues[`layer_${i - 1}`] || 4;
          props.change(`layer_${i}`, prevValue);
        }
      }
    }
    setLayerCount(layerChange);
  }, [layerChange]);

  // normalize parameters--------------------------------------------------------------------------------
  const normalizeLayerRange = (value) => {
    if (!value) return value;
    return Math.trunc(Math.min(Math.max(1, Number(value)), 5));
  };


  // normalize hidden layers unit
  const normalizeUnits = (value) => {
    if (!value) return value;
    return Math.trunc(Math.min(Math.max(1, Number(value)), 16));
  };

  // normalize alpha and extent (>0)
  const preventZero = (value) => {
    if (!value) return value;
    return value < 0 ? '' : value;
  };

  const normalizeRandomState = (value) => {
    if (!value) return value;
    return Math.trunc(Number(value));
  };

  // normalize test_size (0~1)
  const normalizeTestSize = (value) => {
    if (!value) return value;
    return Math.min(Math.max(0, Number(value)), 1);
  };

  const normalizeIteration = (value) => {
    if (!value) return value;
    return Math.trunc(Math.min(Math.max(1, Number(value)), 5000));
  };
  // -------------------------------------------------------------------------------------------------------


  const applyDefaults = (event) => {
    if (event) {
      if (!dirty) {
        const defVals = {
          metric: metrics[1],
          preprocessing: true,
          early_stopping: false,
          patience: 5,
          alpha: 0.0001,
          random_state: 1,
          max_iter: 200,
          test_size: 0.2,
          learning_rate_init: 0.001,
          validation_fraction: 0.2,
          n_layers: 1,
        };

        const defaultLayerValue = 4;
        for (let i = 1; i <= defVals.n_layers; i++) {
          defVals[`layer_${i}`] = defaultLayerValue;
        }

        Object.entries(defVals).forEach(([name, value]) => {
          props.change(name, value);
        })

        const initCount = defVals.n_layers;
        setLayerCount(initCount);
      }
    }
  };


  // The form itself, as being displayed in the DOM
  return (
    <>
      <Form onSubmit={handleSubmit} ref={formElement}>

        <Form.Field>
          <label>Metric
            <span style={{ marginLeft: '5px' }}>
              <Popup
                trigger={<span style={{ fontSize: "13px", color: "blue" }}>ⓘ</span>}
                content='Select the evaluation plot to display: training progression (Loss/R2) or prediction accuracy (True vs Predict).'
                position='top left'
                size='small'
              />
            </span>

          </label>
          <Field
            name="metric"
            placeholder="metrics"
            component={SemanticDropdown}
            options={getDropdownOptions(metrics)}
            onChange={handleMetricVal}
            search
          />
        </Form.Field>

        {currentMetricVal != 'True vs Predict' && <Form.Field>
          <label>Split Mode
            {currentSplit && <span style={{ marginLeft: '5px' }}>
              <Popup
                trigger={<span style={{ fontSize: "13px", color: "blue" }}>ⓘ</span>}
                content={currentSplit != 'Train-Val Split'
                  ? 'Split the data into training, validation, and testing sets.(3 split mode)'
                  : 'Split the data into training and validation sets.(2 split mode)'}
                position='top left'
                size='small'
              />
            </span>}
          </label>


          <Field
            name="splitMode"
            placeholder="Split Mode"
            options={getDropdownOptions(splitMode)}
            component={SemanticDropdown}
            onChange={handleSplit}
            search
          >

          </Field>
        </Form.Field>
        }

        <hr />

        <Form.Field>
          <label>Feature columns</label>
          <Field
            name="featureColumns"
            placeholder='columns'
            options={columns}
            component={MultiSelectDropdown}
            search
          />
        </Form.Field>

        <Form.Field>
          <label>Target column</label>
          <Field
            name="targetColumn"
            placeholder='columns'
            component={SemanticDropdown}
            options={columns}
            search
          />
        </Form.Field>

        <hr />

        <Form.Group width='equal' style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <Form.Field>
            <label>Data Preprocessing:<span style={{ marginLeft: '5px' }}>
              <Popup
                trigger={<span style={{ fontSize: "13px", color: "blue" }}>ⓘ</span>}
                content='if Data Preprocessing is enabled, StandardScaler will be applied to standardize the dataset.'
                position='top left'
                size='small'
              />
            </span>
            </label>
            <Field
              name="preprocessing"
              component={SemCheckbox}
              type='checkbox'
              toggle
            />
          </Form.Field>

          {currentMetricVal != 'True vs Predict' && <span style={{ marginLeft: "5px" }}>
            <Form.Field>
              <label>Early Stopping:
                <span style={{ marginLeft: '5px' }}>
                  <Popup
                    trigger={<span style={{ fontSize: "13px", color: "blue" }}>ⓘ</span>}
                    content="If Early stopping is enabled, training will automatically stop when the validation score stops improving."
                    position='top left'
                    size='small'
                  />
                </span>
              </label>
              <Field
                name="early_stopping"
                component={SemCheckbox}
                type='checkbox'
                toggle
              />
            </Form.Field>
          </span>}

          {earlyStoppingValue && <Form.Field>
            <label>Patience:
              <span style={{ marginLeft: '5px' }}>
                <Popup
                  trigger={<span style={{ fontSize: "13px", color: "blue" }}>ⓘ</span>}
                  content='Number of epochs with no improvement after which training will be stopped.'
                  position='top left'
                  size='small'
                />
              </span>
            </label>
            <Field
              name="patience"
              placeholder='patience'
              component={Input}
              options={input}
              type='number'
              normalize={normalizeIteration}
            />
          </Form.Field>}

        </Form.Group>


        <label style={{ fontWeight: "bold", textDecoration: "underline" }}>Parameters: </label>

        <Form.Group width="equal" style={{ paddingTop: "6px", paddingLeft: "10px" }}>
          <Form.Field>
            <label>Alpha:</label>
            <Field
              name="alpha"
              placeholder='Alpha'
              component={Input}
              // options={input}
              type='number'
              step="0.0001"
              normalize={preventZero}
            />
          </Form.Field>

          <Form.Field>
            <label>Random state:</label>
            <Field
              name="random_state"
              placeholder='Random state'
              component={Input}
              options={input}
              type='number'
              normalize={normalizeRandomState}
            />
          </Form.Field>


          <Form.Field>
            <label>Max iter:
              <span style={{ marginLeft: '5px' }}>
                <Popup
                  trigger={<span style={{ fontSize: "13px", color: "blue" }}>ⓘ</span>}
                  content='Max iter is the Maximum number of iterations over the training data.'
                  position='top left'
                  size='small'
                />
              </span>
            </label>
            <Field
              name="max_iter"
              placeholder='max_iter'
              component={Input}
              options={input}
              type='number'
              normalize={normalizeIteration}
            />
          </Form.Field>

        </Form.Group>

        <Form.Group width="equal" style={{ paddingTop: "6px", paddingLeft: "10px" }}>
          <Form.Field>
            <label>test_size:</label>
            <Field
              name="test_size"
              placeholder='test_size'
              component={Input}
              options={input}
              type='number'
              normalize={normalizeTestSize}
              step="0.1"
            />
          </Form.Field>


          <Form.Field>
            <label>
              Learning rate init:
              <span style={{ marginLeft: '5px' }}>
                <Popup
                  trigger={<span style={{ fontSize: "13px", color: "blue" }}>ⓘ</span>}
                  content='Learning rate init controls the step size at each iteration while moving toward a minimum of a loss function.'
                  position='top left'
                  size='small'
                />
              </span>
            </label>
            <Field
              name="learning_rate_init"
              placeholder='Learning rate init'
              component={Input}
              options={input}
              type='number'
              normalize={normalizeTestSize}
              step="0.001"
            />

          </Form.Field>

        </Form.Group>

        <hr />


        <Form.Field>
          <label>Number of hidden layers:</label>
          <Field
            name="n_layers"
            component={Input}
            options={input}
            type='number'
            normalize={normalizeLayerRange}
          />
        </Form.Field>

        <Form.Group width='equal' style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[...Array(layerChange)].map((_, index) => (
            <Form.Field key={index} style={{ flex: '0 0 auto' }}>
              <label>Layer {index + 1}
                <span style={{ marginLeft: '5px' }}>
                  <Popup
                    trigger={<span style={{ fontSize: "13px", color: "blue" }}>ⓘ</span>}
                    content='default: 4'
                    position='top left'
                    size='small'
                  />
                </span>
              </label>
              <Field
                name={`layer_${index + 1}`}
                placeholder={`No. ${index + 1}`}
                component={Input}
                type='number'
                normalize={normalizeUnits}
              />
            </Form.Field>
          ))}
        </Form.Group>


        <hr />

        <label>Extent:</label>
        <Form.Group widths="equal">


          <Field
            fluid
            name="options.extent.width"
            component={Input}
            options={input}
            placeholder="Width"
            normalize={preventZero}
          />
          <Field
            fluid
            name="options.extent.height"
            component={Input}
            options={input}
            placeholder="Height"
            normalize={preventZero}
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
});
// ------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
const MLPFormWrapped = reduxForm({
  form: 'MLP_Component',
  validate,
})(MLP_Component_Form);

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default MLPFormWrapped;
//-------------------------------------------------------------------------------------------------


