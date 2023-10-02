/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'PeriodicTable' View,
//              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'PeriodicTable' opens a customized form for the 'PeriodicTableChart' visualization
//        component and allows the user to edit its look, feel and behavior in multiple ways.
//        THIS FORM IS CURRENTLY NOT USED SINCE NO CONFIG CHANGES ARE ALLOWED TO BE MADE TO THIS
//        VISCOMP, BUT WE LEAVE THIS FILE HERE FOR THE POSSIBLE FUTURE TO CHANGE THAT FACT.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form } from 'semantic-ui-react';
//=======================
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const PeriodicTableForm = (props) => {

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

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>
      <div>This Form is not used</div>
    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'PeriodicTable',
})(PeriodicTableForm);
//-------------------------------------------------------------------------------------------------
