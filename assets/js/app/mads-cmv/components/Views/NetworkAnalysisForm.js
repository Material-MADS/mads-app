  /*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q6 2024
// ________________________________________________________________________________________________
// Authors: Akihiro Honda
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'NetworkAnalysis' View, driven 
//              by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'NetworkAnalysisForm' opens a customized form for the 'NetworkAnalysis' visualization 
//        component and allows the user to edit its look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             lodash, Internal Form Utilities Support functions.
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm, Label } from 'redux-form';
import { Form, Popup } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import SemCheckbox from '../FormFields/Checkbox';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';

import _ from 'lodash';
import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";

import { cmMax, colorMapOptions } from './FormUtils';
import { getDropdownOptions } from './FormUtils';
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
//const getDropdownOptions = (list) => list.map((i) => ({ key: i, text: i, value: i }));
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
  if (!values.sourceNodeColumn) {
    errors.sourceNodeColumn = 'Required'
  }
  if (!values.targetNodeColumn) {
    errors.targetNodeColumn = 'Required'
  }
  if ((values.sourceNodeColumn && !values.targetNodeColumn)){ 
    errors.mix = 'Required';
  }   

  setSubmitButtonDisable( errors.sourceNodeColumn || errors.targetNodeColumns || errors.mix )
  return errors
}
//=======================
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const NetworkAnalysisForm = (props) => {

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
  const cTags = colorTags.map((c) => ({
    text: c.color,
    value: c.id,
    props: { style: '' },
  }));
  
  const [remainDisabled, setRemainDisabled] = useState(
    !initialValues.remainerEnabled
  );
  // console.log(initialValues)

  const [centralityType, setCentralityType] = useState( initialValues.centrality );
  const [markNode, setMarkNode] = useState( initialValues.markNode );
  const centralitys = [
                     'Not Applicable',
                     'Degree',
                     'Eigenvector',
                     'Katz',
                     'PageRank',
                     'Betweenness',
                     'Closeness',
                    ];
  const [clusteringDisabled, setClusteringDisabled] = useState(
    !initialValues.clusteringEnabled
  );

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Source Node Column </label>
        <Field
          name="sourceNodeColumn"
          component={SemanticDropdown}
          placeholder="Source (Main) Node Column"
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Target Node Column </label>
        <Field
          name="targetNodeColumn"
          component={SemanticDropdown}
          placeholder="Target Node Column"
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Link/Edge Weight Column <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
          content='Please select numerical data. If no selection is made, all weights are calculated as 1.' size='small' /></label>
        <Field
          name="linkWeightColumn"
          component={SemanticDropdown}
          placeholder="Link Weight"
          options={getDropdownOptions(columns, true)}
        />
      </Form.Field>

      <hr />
      <Form.Field>
      <label>Centrality <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
          content='You can choose which centrality measure to visualize based on. 
          The higher the centrality, the larger the node and the redder it is.' size='small' /></label>
        <Field
          name="centrality"
          component={SemanticDropdown}
          placeholder="Centrality Measure"
          options={getDropdownOptions(centralitys)}
          onChange={(e, data) => setCentralityType(data)}
        />
      </Form.Field>

      <hr />
      <Form.Field>
      <label>Marking Node <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
          content='You can mark the nodes you have entered. 
          Enter the name of the desired node with an exact match. 
          The name of node can be found in the "table".' size='small' /></label>
        <Field
          fluid
          name="markNode"
          component={Input}
          placeholder="nodeName you want to mark"
          onChange={(e, data) => setMarkNode(data)}
        />
      </Form.Field>

      <hr />
      <Form.Field>
        <label>Clustering <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
          content='Check this box if you want clustering. In this case, nodes will be color-coded by cluster, 
          not by centrality.' size='small' /></label>
        <Field
          name="clusteringEnabled"
          component={SemCheckbox}
          toggle
          onChange={(e, data) => {
            setClusteringDisabled(!data);
          }}
        />
      </Form.Field>

      {/* {!clusteringDisabled && <div>
        <Form.Field>
          <label>Clustering Forse</label>
          <Field
          fluid
          name="clusterForse"
          component={Input}
          placeholder="clusterForse"
          type="number"
            step={0.0001}
            min={0.0050}
            max={0.0005}
        />
        </Form.Field> */}
      {/* </div>} */}

      <hr />
      <Form.Field>
      <label>Remain lonely Nodes? <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
          content='Check this box if you want to remain a single node with no links' size='small' /></label>
        <Field
          name="remainLonelyNodes"
          component={SemCheckbox}
          toggle
          onChange={(e, data) => {
            setRemainDisabled(!data);
          }}
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
  form: 'NetworkAnalysis',
  validate,
})(NetworkAnalysisForm);
//-------------------------------------------------------------------------------------------------