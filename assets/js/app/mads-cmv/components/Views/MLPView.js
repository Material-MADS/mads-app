/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2026
// ________________________________________________________________________________________________
// Authors: Miyu Shinotsuka [2026]
// ________________________________________________________________________________________________
// Description: This is the Inner workings and Content Manager Controler of the
//              'MLP' View
// ------------------------------------------------------------------------------------------------
// Notes: 'MLPView' is the manager of all current input that controls the final
//        view of the 'MLPVis' visualization component.
// ------------------------------------------------------------------------------------------------
// References: Internal ViewWrapper & Form Utility Support, Internal "MLP"
//             View & Form libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import convertExtentValues from './FormUtils';

import MLP_Component from '../VisComponents/MLPVis';
import MLP_Component_Form from './MLPForm';
import _, { set } from 'lodash';
import React, { useState, useRef, useEffect, useMemo } from 'react';
//-------------------------------------------------------------------------------------------------

const settings = {
  options: { title: 'MLP' },
};


//-------------------------------------------------------------------------------------------------
// Works as a wrapper class for MLP_Component_View (a function component uses React hooks) and 
// is necessary to work properly within CADS class system
//-------------------------------------------------------------------------------------------------
class MLP_Base_Component extends withCommandInterface(MLP_Component, MLP_Component_Form, settings) {
  handleSubmit = (values) => {
    if (this.props.customSubmit) {
      const currentColumns = typeof this.getColumnOptionArray === 'function'
        ? this.getColumnOptionArray()
        : [];

      this.props.customSubmit(values, currentColumns);
    }
  };

  // Manages Save Model Requests
  handleModelSave = (name, overwrite, id) => {
    // Note: override this if necessary
    const { actions, saveParams } = this.props;

    if (this.formReference && typeof this.formReference.submit === 'function') {
      this.formReference.submit();
    }

    actions.saveModel(name, saveParams, overwrite, id);
  };

  composeSubmittingData = (values) => { };

  mapData = () => {
    return this.props.data;
  };

  render() {
    // const columns = typeof this.getColumnOptionArray === 'function'
    //   ? this.getColumnOptionArray()
    //   : [];

    const element = super.render();

    if (element) {
      return React.cloneElement(element);
    }

    return null;
  }
}

const MLP_Component_View = (props) => {

  const formRef = useRef(null);

  const {
    id,
    view,
    updateView,
    colorTags,
    actions,
    dataset,
    // columns,
  } = props;

  const [newValues, setNewValues] = useState(null);
  const [version, setVersion] = useState(0);

  // extract and process data
  const processedData = useMemo(() => {
    if (!dataset || !dataset.main || !dataset.main.data) {
      return {};
    }


    const extractedData = {};
    const df = new DataFrame(dataset.main.data);


    if (newValues && newValues.targetColumn) {
      // extract target column
      const targetName = newValues.targetColumn;

      const tc = df.get ? df.get(targetName) : df[targetName];

      if (tc && tc.values) {
        extractedData[newValues.targetColumn] = typeof tc.values.toArray === 'function' ? tc.values.toArray() : tc.values;
      }

      // extract feature columns
      newValues.featureColumns.forEach((c) => {
        const fc = df.get(c);
        if (fc && fc.values) {
          extractedData[c] = typeof fc.values.toArray === 'function' ? fc.values.toArray() : fc.values;
        }
      });
    }

    // Manages data changes in the view
    const data = { d1: { data: [] }, d2: { data: [] } };

    // receive data from mlp.py => send data to MLPVis
    if (dataset[id]) {
      const metric = view.settings.metric;

      let xx, xx2, yy, yy2;

      // Loss/R2 Learning Curve
      if (dataset[id]['d1']['epoch']) {
        xx = dataset[id]['d1']['epoch'];
        xx2 = dataset[id]['d2']['epoch'] ? dataset[id]['d2']['epoch'] : [];
        yy = dataset[id]['d1'][metric] ? dataset[id]['d1'][metric] : [];
        yy2 = dataset[id]['d2'][metric] ? dataset[id]['d2'][metric] : [];

        // Train data
        xx.forEach((x, i) => {
          const item = {};
          item['epoch'] = x;
          item[metric] = yy[i];
          data.d1.data.push(item);
        });

        // Validation data
        if (yy2.length > 0) {
          xx2.forEach((x, i) => {
            const item = {};
            item['epoch'] = x;
            item[metric] = yy2[i];
            data.d2.data.push(item);
          });
        }

        // True vs Predict plot
      } else if (dataset[id]['d1']['Predict']) {
        xx = dataset[id]['d1']['Predict']; // y_train predicted
        xx2 = dataset[id]['d2']['Predict'] ? dataset[id]['d2']['Predict'] : [];  // y_test predicted
        yy = dataset[id]['d1']['True'] ? dataset[id]['d1']['True'] : [];  // y_train
        yy2 = dataset[id]['d2']['True'] ? dataset[id]['d2']['True'] : [];  // y_test

        // Train data
        xx.forEach((x, i) => {
          const item = {};
          item['Predict'] = x;
          item['True'] = yy[i];
          data.d1.data.push(item);
        });

        // Test data
        if (yy2.length > 0) {
          xx2.forEach((x, i) => {
            const item = {};
            item['Predict'] = x;
            item['True'] = yy2[i];
            data.d2.data.push(item);
          });
        }

      }
      // Prevent invalid values
      else {
        xx = [];
        xx2 = [];
        yy = [];
        yy2 = [];
      }

      if (xx == undefined || !Array.isArray(xx) || yy == undefined || !Array.isArray(yy)) {
        return {};
      }

      if (!(dataset.main.schema.fields.some(e => e.name === props.view.settings.targetColumn))) {
        data.d1 = { data: [] };
        data.d2 = { data: [] };
        data["resetRequest"] = true;
        data["resetTitle"] = "MLP";
      }

      const targetDataKeys = Object.keys(dataset[id] || {});

      // ex: scores, best_epoch
      targetDataKeys.forEach((key) => {
        if (key !== 'd1' && key !== 'd2') {
          data[key] = dataset[id][key];
        }
      });

    }

    const finalData = { ...extractedData, ...data };

    return finalData;
  }, [dataset, id, view, newValues]);


  // form submit
  const mlpHandleSubmit = (values, availableColumns) => {

    let updatedValues = { ...values };

    // filter out non-existing columns & colorTags
    if (updatedValues.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      updatedValues.filter = filteredFilters;
    }

    // filter out featureColumns
    if (updatedValues.featureColumns) {
      const cols = availableColumns || [];
      const filteredColumns = updatedValues.featureColumns.filter((f) =>
        cols.includes(f)
      );
      updatedValues.featureColumns = filteredColumns;
    }


    //----------data (→mlp.py)---------------------------------
    const data = {};
    const df = new DataFrame(dataset.main.data);
    const tc = df.get(updatedValues.targetColumn);
    data[updatedValues.targetColumn] = tc.values.toArray();

    updatedValues.featureColumns.forEach((c) => {
      const fc = df.get(c);
      data[c] = fc.values.toArray();
    });


    // set mapping
    updatedValues.mappings = {
      x: updatedValues.targetColumn,
      y: `${updatedValues.targetColumn}--Predicted`,
    };

    updatedValues = convertExtentValues(updatedValues);
    setNewValues(updatedValues);
    setVersion(v => v + 1);

    actions.sendRequestViewUpdate(view, updatedValues, data);
    //----------------------------------------------------------
  };


  const tmpViewParamsList = { view, newValues: newValues, data: processedData };

  const tmpViewParams = useMemo(() => ({
    view,
    newValues: newValues,
    data: processedData
  }), [view, processedData, newValues]);


  return (
    <MLP_Base_Component
      {...props}
      ref={formRef}
      customSubmit={mlpHandleSubmit}
      data={processedData}
      saveParams={tmpViewParams}

    />
  );
};

export default MLP_Component_View;



