/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'FeatureEngineering' View,
//              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'FeatureEngineering Form' opens a customized form for the
//        'FeatureEngineering' visualization component and allows the user to edit its look,
//        feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             lodash lib
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import { Field, reduxForm, Label, change } from 'redux-form';
import { Button, Dropdown, Form, Popup, Checkbox} from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';

import { getDropdownOptions } from './FormUtils';

import { useSelector } from "react-redux";
import PeriodicTable from '../VisComponents/PeriodicTableVis';

// import _, { values } from 'lodash';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================

const firstOrderDescriptors = ["x", '1/(x)', '(x)^2', '1/(x)^2', '(x)^3', '1/(x)^3', 'sqrt(x)', '1/sqrt(x)', 'exp(x)', '1/exp(x)', 'ln(x)', '1/ln(x)'];
const selectedDataSourceList = ['Data Management', 'Catalyst Property Conversion Component'];
const periodicTable = ['all', 'atomic_number', 'atomic_radius_simple', 'atomic_radius_rahm', 'atomic_volume', 'atomic_weight', 'boiling_point', 'bulk_modulus', 'c6_gb', 'covalent_radius_cordero', 'covalent_radius_pyykko_simple', 'covalent_radius_pyykko_double', 'covalent_radius_pyykko_triple', 'covalent_radius_slater', 'density', 'dipole_polarizability', 'electron_negativity', 'electron_affinity', 'en_allen', 'en_ghosh', 'en_pauling', 'first_ion_en', 'fusion_enthalpy', 'gs_bandgap', 'gs_energy', 'gs_est_bcc_latcnt', 'gs_est_fcc_latcnt', 'gs_mag_moment', 'gs_volume_per', 'hhi_p', 'hhi_r', 'heat_capacity_mass', 'heat_capacity_molar', 'icsd_volume', 'evaporation_heat', 'heat_of_formation', 'lattice_constant', 'mendeleev_number', 'melting_point', 'molar_volume', 'num_unfilled', 'num_valence', 'num_d_unfilled', 'num_d_valence', 'num_f_unfilled', 'num_f_valence', 'num_p_unfilled', 'num_p_valence', 'num_s_unfilled', 'num_s_valence', 'period', 'specific_heat', 'thermal_conductivity', 'vdw_radius_simple', 'vdw_radius_alvarez', 'vdw_radius_mm3', 'vdw_radius_uff', 'sound_velocity', 'Polarizability'];


//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================

const validate = (values, props) => {
  const errors = {}

  // Make sure the correct dataset is loaded
  if (values.selectedDataSource === 'Data Management') {
    const descriptorColumns = values.descriptorColumns;
    const targetColumns = values.targetColumns;
    const testDescriptorColumns = descriptorColumns ? descriptorColumns.map(e => props.columns.some(column => column.value === e)) : [];
    const testTargetColumns = targetColumns ? targetColumns.map(e => props.columns.some(column => column.value === e)) : [];
    if (testDescriptorColumns && testDescriptorColumns.some(e => !e)) {
      values.descriptorColumns = []
    }
    if (testTargetColumns && testTargetColumns.some(e => !e)) {
      values.targetColumns =  []
    }
  } else if (values.selectedDataSource === 'Catalyst Property Conversion Component') {
    const cpcId = values.propertyConversionId;
    const cpcIdBoolean = cpcId ? props.dataset[cpcId] : true;
    if (!cpcIdBoolean) {
      values.targetColumns = [];
      values.propertyConversionId = ''
      values.propertyConversionDS = {};
    } 
  }

  // Validate each Form
  if (values.descriptorColumns && values.descriptorColumns.length === 0) {
    errors.descriptorColumns = 'Required';
  }
  if (values.targetColumns && values.targetColumns.length === 0) {
    errors.targetColumns = 'Required';
  }
  if (values.firstOrderDescriptors && values.firstOrderDescriptors.length === 0) {
    errors.firstOrderDescriptors = 'Required';
  }

  if (values.selectedDataSource === 'Data Management') {
    setSubmitButtonDisable(errors.descriptorColumns || errors.targetColumns || errors.firstOrderDescriptors)
  } else if (values.selectedDataSource === 'Catalyst Property Conversion Component') {
    if (Object.keys(values.propertyConversionDS).length === 0) {
      errors.propertyConversionDS = 'Required';
    }
    setSubmitButtonDisable(errors.descriptorColumns || errors.targetColumns || errors.firstOrderDescriptors || errors.propertyConversionDS)
  }

  return errors
}
//=======================

const getAvailableColumns = (columns, selected) => {
  return columns.filter(column => !selected.includes(column.value));
}



//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const FeatureEngineeringForm = (props) => {

  // parameters and such
  const {
    handleSubmit,
    initialValues,
    defaultOptions,
    pristine,
    reset,
    submitting,
    colorTags,
    columns,
    id,
  } = props;

  const { views, dataset } = useSelector((state) => ({
    views: state.views,
    dataset: state.dataset,
  }));
  const idCPC = views.filter((view) => view.name === 'CatalystPropertyConversion').map((view) => view.id)
  const idHaveData = idCPC.filter((id) => dataset.hasOwnProperty(id)).filter((id) => dataset[id])

  initialValues.options = {...defaultOptions, ...(initialValues.options) };
  const [descriptorColumns, setDescriptorColumns] = useState(initialValues.descriptorColumns);
  const [targetColumns, setTargetColumns] = useState(initialValues.targetColumns);
  const [fieldsAreShowing, toggleVisibleFields] = useState(
    initialValues.selectedDataSource != selectedDataSourceList[1]
  );
  const [cpcId, setCpcId] = useState(initialValues.propertyConversionId);
  const [targetColumnsCPC, setTargetColumnsCPC] = useState(views.some((view) => view.id === cpcId) ? views.find((view) => view.id === cpcId).settings.targetColumns :[]);

  const selectCpcId = (e, data) => {
    props.change('propertyConversionDS', dataset[data.value]);
    props.change('propertyConversionId', data.value);
    props.change('targetColumns', ['A']);
    setCpcId(data.value);
    setTargetColumnsCPC(() => {
      const selectedView = views.find((view) => view.id === data.value);
      return selectedView.settings.targetColumns
    });
  }

  useEffect(() => {
    if (initialValues.selectedDataSource === 'Catalyst Property Conversion Component') {
      props.change('propertyConversionDS', dataset[cpcId]);
      const testTargetCPC = initialValues.targetColumns.map((preTarget) => targetColumnsCPC.some((latestTarget) => preTarget === latestTarget));
      if (testTargetCPC.some((e) => !e)) {
        props.change('targetColumns', []);
      }
    }
  }, [])


  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field> 
        <label>Selected Data Source<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='You can choose to use the Dataset of Data Management or Catalyst Property Conversion Component.' size='small' />:</label>
        <Field
          name="selectedDataSource"
          component={SemanticDropdown}
          placeholder="SelectedDataSource"
          options={getDropdownOptions(selectedDataSourceList)}
          onChange={(e, data) => {
            toggleVisibleFields(data != selectedDataSourceList[1]);
            props.change('descriptorColumns', []);
            props.change('targetColumns', []);
            setDescriptorColumns(initialValues.descriptorColumns);
            setTargetColumns(initialValues.targetColumns);
          }}
        />
      </Form.Field>

      {/* These Form Fields are for using Feature Engineering Source */}
      {!fieldsAreShowing &&
        <Form.Field >
          <label>Catalyst Property Conversion Data Source<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Choose which Catalyst Property Conversion Component to use.' size='small' />:</label>
          { ( idHaveData.length === 0 ) ? <label style={{margin:'0px auto'}}>There is no available Catalyst Property Conversion Data Source</label> :
            idHaveData.map((id) => {
              return (
                <Form.Field key={id}>
                  <Checkbox
                    label={'Catalyst Property Conversion id :' + id}
                    name='propertyConversionDS'
                    value={id}
                    checked={cpcId === id}
                    onChange={(e, data) => selectCpcId(e, data)}
                    />
                </Form.Field>
                )
            })}
        </Form.Field>}

      <hr />

      <Form.Field>
        <label>Base Descriptor Columns<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='select discriptors to generate First Order Descriptors When Selected Data Source is Data Management, you can choose Base Descriptor Columns from columns of Data Management. When Selected Data Source is Catalyst Property Conversion Component, you can choose from Columns of Catalyst Property Conversion Component.' size='small' /></label>
        <Field
          name="descriptorColumns"
          placeholder="Descriptor Columns"
          component={MultiSelectDropdown}
          options={fieldsAreShowing ? getAvailableColumns(columns, targetColumns) : getDropdownOptions(periodicTable)}
          onChange={(newVal) => {setDescriptorColumns(newVal)}}
          search
        />
      </Form.Field>

      <Form.Field>
        <label>Target Columns<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='select targets for the dataset. When Selected Data Source is Data Management, you can choose Target Columns from columns of Data Management. When Selected Data Source is Catalyst Property Conversion Component, you can choose from Target Columns of Catalyst Property Conversion Component.' size='small' /></label>
        <Field
          name="targetColumns"
          placeholder="Target Columns"
          component={MultiSelectDropdown}
          options={fieldsAreShowing ? getAvailableColumns(columns, descriptorColumns) : getDropdownOptions(targetColumnsCPC)}
          onChange={(newVal) => {setTargetColumns(newVal)}}
          search
        />
      </Form.Field>
      <hr />

      <Form.Field>
        <label>First Order Descriptors<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='select first order descriptor you want to generate' size='small' /></label>
        <Field
          name="firstOrderDescriptors"
          placeholder="First Order Descriptors"
          component={MultiSelectDropdown}
          options={getDropdownOptions(firstOrderDescriptors)}
          search
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

    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'FeatureEngineering',
  validate
})(FeatureEngineeringForm);
//-------------------------------------------------------------------------------------------------
