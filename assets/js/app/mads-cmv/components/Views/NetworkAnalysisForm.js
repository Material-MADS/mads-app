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
import { Form, Popup, Dropdown, Container, Header, Segment } from 'semantic-ui-react';

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

  // console.log(props)
  const errors = {};
  if (!values.sourceNodeColumn) {
    errors.sourceNodeColumn = 'Required'
  }
  if (!values.targetNodeColumn) {
    errors.targetNodeColumn = 'Required'
  }
  if ((values.sourceNodeColumn && !values.targetNodeColumn)){ 
    errors.mix = 'Required'
  }
  if (values.clusteringEnabled && !values.clusteringMethod) {
    errors.clusteringMethod = 'Required'
  }
  if (values.layoutEnabled && !values.graphLayout) {
    errors.graphLayout = 'Required'
  }

  setSubmitButtonDisable( errors.sourceNodeColumn || errors.targetNodeColumns || errors.mix
     || errors.clusteringMethod || errors.graphLayout )
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
  
  // const [remainDisabled, setRemainDisabled] = useState(
  //   !initialValues.remainerEnabled
  // );
  // const [deleteDisabled, setDeleteDisabled] = useState(
  //   !initialValues.deleterEnabled
  // );
  // console.log(initialValues)

  const [centralityType, setCentralityType] = useState( initialValues.centrality );
  const [clusterType, setClusterType] = useState( initialValues.cluster );
  const [layoutType, setLayoutType] = useState( initialValues.layout );
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
  const clusterMethods = [
                        'Greedy',
                        'Louvain',
                        'Girvan-Newman',
                        'Label Propagation',
                      ];
  const layouts = [
                  'Force-Directed Layouts',
                  'Circular Layout',
                  // "Spectral Layout",
                  // "Hierarchical Layout"
                ];
  const gradients = [
    { key: 'RtB', text: 'Red to Blue', value: 'RtB', colors: ['#ff0000', '#0000ff'] },
    { key: 'BtO', text: 'Black to Orange', value: 'BtO', colors: ['#000000', '#ffa500'] },
    { key: 'YtG', text: 'Yellow to Green', value: 'YtG', colors: ['#ffff00', '#00ff00'] },
    { key: 'PtP', text: 'Purple to Pink', value: 'PtP', colors: ['#800080','#ff69b4'] },
    { key: 'BtG', text: 'Black to Grey', value: 'BtG', colors: ['#000000', '#808080'] },
    { key: 'alG', text: 'All Gray', value: 'alG', colors: ['#808080', '#808080'] }
  ];

  if(!initialValues.clusterForce){ initialValues.clusterForce = 0.25 };
  if(!initialValues.nodeAttraction){ initialValues.nodeAttraction = 0.1 };

  const [colorDisabled, setColorDisabled] = useState(
    !initialValues.colorAssignmentEnabled
  );

  const [clusteringDisabled, setClusteringDisabled] = useState(
    !initialValues.clusteringEnabled
  );
  const [layoutDisabled, setLayoutDisabled] = useState(
    !initialValues.layoutEnabled
  );

  const [selectedNodeGradient, setSelectedNodeGradient] = useState(!initialValues.nodeGradient ? gradients[0] 
    : gradients.find(gradient => gradient.key === initialValues.nodeGradient));
  const onNodeGradientChange = (value) => {
    const selected = gradients.find(gradient => gradient.value == value);
    setSelectedNodeGradient(selected);
  };
  const [selectedLinkGradient, setSelectedLinkGradient] = useState(!initialValues.linkGradient ? gradients[4] 
    : gradients.find(gradient => gradient.key === initialValues.linkGradient));
  const onLinkGradientChange = (value) => {
    const selected = gradients.find(gradient => gradient.value == value);
    setSelectedLinkGradient(selected);
  };
  const generateGradient = (colors, steps) => {
    const stepFactor = 1 / (steps - 1);
    const gradientColors = [];

    for (let i = 0; i < steps; i++) {
      const r = Math.round(colors[0][0] + stepFactor * i * (colors[1][0] - colors[0][0]));
      const g = Math.round(colors[0][1] + stepFactor * i * (colors[1][1] - colors[0][1]));
      const b = Math.round(colors[0][2] + stepFactor * i * (colors[1][2] - colors[0][2]));
      gradientColors.push(`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`);
    }
  
    return gradientColors;
  };
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  };

  
  

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
        <label>Change Colors <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
          content='Check this box if you want to change color gradation of Nodes or Links' size='small' /></label>
        <Field
          name="colorAssignmentEnabled"
          component={SemCheckbox}
          toggle
          onChange={(e, data) => {
            setColorDisabled(!data);
          }}
        />
      </Form.Field>

      {!colorDisabled && <div>
        <Form.Field>
          <label>Node Color Palette</label>
          <Field
            name="nodeGradient"
            component={SemanticDropdown}
            options={gradients}
            placeholder="Node Color Map"
            onChange={(event, value) => onNodeGradientChange(value)}
          />
        </Form.Field>
        <div style={{ display: 'flex' }}>
          {generateGradient(selectedNodeGradient.colors.map(hexToRgb), 20).map((color, index) => (
            <div
              key={index}
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: color
              }}
            ></div>
          ))}
        </div>
        <br />
        <Form.Field>
          <label>Link/Edge Color Palette</label>
          <Field
            name="linkGradient"
            component={SemanticDropdown}
            options={gradients}
            placeholder="Link Color Map"
            onChange={(event, value) => onLinkGradientChange(value)}
          />
        </Form.Field>
        <div style={{ display: 'flex' }}>
          {generateGradient(selectedLinkGradient.colors.map(hexToRgb), 20).map((color, index) => (
            <div
              key={index}
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: color
              }}
            ></div>
          ))}
        </div>
      </div>}

      <hr />
      <Form.Group widths="equal">
        <Form.Field widths={1}>
          <label>Attraction between nodes </label>
          <Field
            fluid
            name="nodeAttraction"
            component={inputTrad}
            type="number"
            step={0.01} 
            min={0.01}
            max={0.25}
          />
        </Form.Field>
        <div style={{ marginRight: "2rem" }}></div>
        <Form.Field>
          <label>Make it a Petri Net <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
              content='Check this box if you want to make it a Petri Net, 
                  When a node “A+B” is inserted in the “source” column, it creates a link that splits the node.' size='small' /></label>
          <Field
            name="makePetriNet"
            component={SemCheckbox}
            toggle
          />
        </Form.Field>
        <Form.Field>
          <label>Make it an undirected graph <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
              content='By default, a directed graph is generated. 
              Check this box if you want to make it an undirected graph' size='small' /></label>
          <Field
            name="makeUndirectedGraph"
            component={SemCheckbox}
            toggle
          />
        </Form.Field>
      </Form.Group>

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

      {!clusteringDisabled && <div>
        <Form.Group width="equal">
          <Form.Field width={12}>
            <label>Clustering Method</label>
            <Field
            fluid
            name="clusteringMethod"
            component={SemanticDropdown}
            placeholder="greedy"
            options={getDropdownOptions(clusterMethods)}
            onChange={(e, data) => setClusterType(data)}
          />
          </Form.Field>
          <Form.Field>
            <label>Clustering Force </label>
            <Field
              fluid
              name="clusterForce"
              component={inputTrad}
              type="number"
              step={0.05}
              min={0.05}
              max={1}
            />
          </Form.Field>
        </Form.Group>
      </div>}

      <hr />
      <Form.Field>
        <label>Change Layout <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
          content='Check this box if you want to change layout. Default is Force-Directed Layouts applied' size='small' /></label>
        <Field
          name="layoutEnabled"
          component={SemCheckbox}
          toggle
          onChange={(e, data) => {
            setLayoutDisabled(!data);
          }}
        />
      </Form.Field>

      {!layoutDisabled && <div>
        <Form.Field>
          <label>Graph Layouts </label>
          <Field
          fluid
          name="graphLayout"
          component={SemanticDropdown}
          placeholder="Force-Directed Layouts"
          options={getDropdownOptions(layouts)}
          onChange={(e, data) => setLayoutType(data)}
        />
        </Form.Field>
      </div>}

      <hr />
      <Form.Group widths="equal">
        <Form.Field>
        <label>Delete isolated networks? <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
            content='Check this box if you want to delete networks not connected to the largest network' size='small' /></label>
          <Field
            name="deleteIsolatedNetworks"
            component={SemCheckbox}
            toggle
            // onChange={(e, data) => {
            //   setDeleteDisabled(!data);
            // }}
          />
        </Form.Field>
        <Form.Field>
        <label>Remain lonely Nodes? <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
            content='Check this box if you want to remain a single node with no links' size='small' /></label>
          <Field
            name="remainLonelyNodes"
            component={SemCheckbox}
            toggle
            // onChange={(e, data) => {
            //   setRemainDisabled(!data);
            // }}
          />
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