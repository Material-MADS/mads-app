/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Yoshiki Hasukawa (Student Developer and Component Design) [2023]
//          Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'GaussianProcess' View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'GaussianProcessForm' opens a customized form for the 'GaussianProcess' visualization component and allows
//        the user to edit its look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             lodash & various color palettes, Internal Form Utilities Support functions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, FieldArray, getFormValues, getFormInitialValues } from 'redux-form';
import { Form, Button, Modal, Popup } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';

import { DataFrame } from 'pandas-js'
import _, { forEach } from 'lodash';
import inputTrad from '../FormFields/inputTraditional';
import $ from 'jquery'

import api from '../../api';
import { html } from 'd3';


//-------------------------------------------------------------------------------------------------

var datasetInfo = {}

//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const getDropdownOptions = (list) => list.map((i) => ({ key: i, text: i, value: i }));

//=======================

//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================


//=======================
const validate = (values, props) => {
  const errors = {};
  if (!values.information) {
    errors.information = 'Required'
  }

  if (!values.targetColumn) {
    errors.targetColumn = 'Required'
  }

  if (!values.targetEI) {
    errors.targetEI = 'Required'
  }

  if (!values.kernel) {
    errors.kernel = 'Required'
  }

  if (!values.numberOfElements || (values.numberOfElements < 10 || values.numberOfElements > 500)) {
    errors.numberOfElements = 'The value must be between 10 and 500, inclusive'
  }


  if (!values.featureColumns || !values.featureColumns.length) {
    errors.featureColumns = { _error: 'At least one feature columns must be entered'}
  } else {
    const featureArrayErrors = [];
    values.featureColumns.forEach((feature, featureIndex) => {
      const featureErrors = {};
      if (!feature || !feature.column) {
        featureErrors.column = 'Required';
        featureArrayErrors[featureIndex] = featureErrors;
      }
      if (!feature || !feature.min) {
        featureErrors.min = 'Required';
        featureArrayErrors[featureIndex] = featureErrors;
      }
      if (!feature || !feature.max) {
        featureErrors.max = 'Required';
        featureArrayErrors[featureIndex] = featureErrors;
      }
    })
    if(featureArrayErrors.length) {
      errors.featureColumns = featureArrayErrors
    }

  }
  setSubmitButtonDisable(errors.information || errors.targetColumn || errors.featureColumns || errors.kernel || errors.numberOfElements)
  return errors
}

//=======================
//-------------------------------------------------------------------------------------------------


const renderFeature = ({ fields, meta: { touched, error, warning }, column, handleFeatureName}) => (
  <>
    {fields.map((feature, index) =>
      <Form.Group widths="equal" key={index}>
        <Field
          name={`${feature}.column`}
          component={SemanticDropdown}
          placeholder={`feature column ${index + 1}`}
          options={column}
          onChange={(e, data) => handleFeatureName(index, data)}
        />
        <Popup style={{whiteSpace: 'pre-wrap'}} trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content={
            <>Min and Max represent the range in which the user wants the machine to make predictions. <br />-----------------<br />{datasetInfo}</>
          } size='small' wide />
        <Field
          fluid
          name={`${feature}.min`}
          component={Input}
          type="number"
          placeholder="minimum"
          label="min"
        />
        <Field
          fluid
          name={`${feature}.max`}
          component={Input}
          type="number"
          placeholder="maximum"
          label="max"
        />

        {/* <Field
          fluid
          name={`${feature}.step`}
          component={Input}
          type="number"
          placeholder="step"
          label="step"
        /> */}

      </Form.Group>
    )}
    <Form.Field>
      <Button type="button" onClick={() => fields.push()}>Add Feature</Button>
      <Button type="button" onClick={() => fields.pop()}>Remove Feature</Button>
    </Form.Field>
      {true &&
        ((error && <i style={{ color: '#9f3a38', fontWeight: 'bold' }}>{error}</i>) ||
          (warning && <i style={{ color: '#e07407', fontWeight: 'bold' }}>{warning}</i>))}
  </>
)
//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const GaussianProcessForm = (props) => {
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
    invalid,
    isLoggedIn,
    dataset
  } = props;
  const cTags = colorTags.map((c) => ({
    text: c.color,
    value: c.id,
    props: { style: '' },
  }));


  datasetInfo = "";
  const df = new DataFrame(dataset.main.data);
  for(var i = 0; i < columns.length; i++){
    const pandaCol = df.get(columns[i].key);
    const jsCol = pandaCol.values.toArray();
    datasetInfo += columns[i].key + ":   Min = " + Math.min(...jsCol) + ",   Max = " + Math.max(...jsCol) + "\n";
  }



  if(!initialValues.numberOfElements){ initialValues.numberOfElements = 100 };

  const informaion = ['Prediction', 'Standard Deviation', 'Expected Improvement', 'Proposed experimental conditions'];
  const targetEI = ['Maximization', 'Minimization']
  const kernels = [
               'ConstantKernel() * RBF() + WhiteKernel()',
               'ConstantKernel() * DotProduct() + WhiteKernel()',
               'ConstantKernel() * RBF() + WhiteKernel() + ConstantKernel() * DotProduct()',
               'ConstantKernel() * RBF(np.ones()) + WhiteKernel()',
               'ConstantKernel() * RBF(np.ones()) + WhiteKernel() + ConstantKernel() * DotProduct()',
              //  ConstantKernel() * Matern(nu=1.5) + WhiteKernel(),
              //  ConstantKernel() * Matern(nu=1.5) + WhiteKernel() + ConstantKernel() * DotProduct(),
              //  ConstantKernel() * Matern(nu=0.5) + WhiteKernel(),
              //  ConstantKernel() * Matern(nu=0.5) + WhiteKernel() + ConstantKernel() * DotProduct(),
              //  ConstantKernel() * Matern(nu=2.5) + WhiteKernel(),
              //  ConstantKernel() * Matern(nu=2.5) + WhiteKernel() + ConstantKernel() * DotProduct()
             ];

  const [currentServerInfo, setServerInfo] = useState("No Info");
  const [featureName, setFeatureName] = useState( initialValues.featureColumns.map((i) => i.column));
  const [targetName, setTargetName] = useState( initialValues.targetColumn );
  const [kernelType, setKernelType] = useState( initialValues.kernel );

  const handleFeatureName = (index, value) => {
    const updatedFeatureName = [...featureName];
    updatedFeatureName[index] = value;
    setFeatureName(updatedFeatureName);
  };
  const onGetServerInfoClick = async (e, value) => {
    setServerInfo("Score: Stand by, being calculated (might take some time) ...");
    const data = {};
    const settings = {route: "query", featureColumns: featureName, targetColumn: targetName, kernel: kernelType}
    const df = new DataFrame(value.value.main.data);
    const tc = df.get(targetName);
    data[targetName] = tc.values.toArray();

    featureName.forEach((c) => {
      const fc = df.get(c);
      data[c] = fc.values.toArray();
    });

    const res = await api.views.sendRequestViewUpdate({settings: settings, id: null,
    type: 'gaussianProcess'}, data);
    const retres = res.data;

    // console.log(retres);
    setServerInfo("Score: " + retres.serverReply);

    return true;
  }


  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit} >

      <Form.Field>
        <label>Feature Columns:</label>
        <Form.Field width={7}>
          <label>Number of elements <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='This represents how many elements the machine divides that range into, thereby allowing the user to control how detailed or accurate the predictions may be. Maximum value is 500.' size='small' />:</label>
          <Field
            name="numberOfElements"
            component={Input}
            type="number"
            step={1}
            min={10}
            max={500}
          />
        </Form.Field>

        <FieldArray
          name="featureColumns"
          component={renderFeature}
          column={columns}
          handleFeatureName={handleFeatureName}
        />
      </Form.Field>

      <hr />

      <Form.Field>
        <label>Target Column</label>
        <Field
          name="targetColumn"
          component={SemanticDropdown}
          placeholder="target column"
          options={columns}
          onChange={(e, data) => setTargetName(data)}
        />
      </Form.Field>
      <Form.Field>
      <label>Target EI <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='To maximize or minimize depends on how the acquisition function is defined. If using Expected Improvement acquisition function, then you should maximize.' size='small' />:</label>
        <Field
          name="targetEI"
          component={SemanticDropdown}
          placeholder="Maximize or Minimize"
          options={getDropdownOptions(targetEI)}
        />
      </Form.Field>

      <hr />

      <Form.Field>
        <label>Kernel <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='The kernel function essentially tells the model how similar two data points (xₙ, xₘ) are. Several kernel functions are available for use with different types of data.' size='small' />:</label>
        <Field
          name="kernel"
          component={SemanticDropdown}
          placeholder="Kernel"
          options={getDropdownOptions(kernels)}
          onChange={(e, data) => setKernelType(data)}
        />
      </Form.Field>
      <Form.Field>
        <Button
        color="blue"
        onClick={onGetServerInfoClick}
        value={dataset}
        disabled={!(featureName.length && targetName && kernelType) }
        >
          Get Score
        </Button>
        <Popup style={{whiteSpace: 'pre-wrap'}} trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content={
            <>Returns R² score from cross validation, where data set is randomly split to 20% test and 80% train data. <br />(This calculations might take more then a minute with a large data set.)</>
          } size='small' wide />

        <br></br>
        <label>{currentServerInfo}</label>
      </Form.Field>

      <hr/>

      <Form.Field>
        <label>Information <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='Select what you want to visualize.' size='small' />:</label>
        <Field
          name="information"
          component={SemanticDropdown}
          placeholder="information"
          options={getDropdownOptions(informaion)}
        />
      </Form.Field>

      <hr />

      <Form.Group widths="four">
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

      <input
        type="hidden"
        name="options.camera"
      />
    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'GaussianProcess',
  validate,
})(GaussianProcessForm);
//-------------------------------------------------------------------------------------------------


