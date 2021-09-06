import React, { useState } from 'react';
import { Field, reduxForm, Label, change } from 'redux-form';
import { Button, Form } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import SemCheckbox from '../FormFields/Checkbox';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';
import TextArea from '../FormFields/TextArea';
import _ from 'lodash';


const Molecule3DForm = (props) => {
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


  const fileChange = e => {
    var file = e.target.files[0]; // File object
    var reader = new FileReader();

    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        props.change('molStr', evt.target.result);
        var trimmedMolStr = evt.target.result.toString().replace(/\s/g, '').toLowerCase();
        var formulaPos = trimmedMolStr.indexOf("<formula>");
        if(formulaPos != -1){
          var formula = trimmedMolStr.substr((formulaPos + 9));
          formula = formula.substring(0, formula.indexOf(">"));
          props.change('molForm', formula.toUpperCase());
        }
        else{
          props.change('molForm', "");
        }

        var csidPos = trimmedMolStr.indexOf("<csid>");
        if(csidPos != -1){
          var csIdStr = trimmedMolStr.substr((csidPos + 6));
          csIdStr = csIdStr.substring(0, csIdStr.indexOf("$"));
          props.change('molUrl', ("http://www.chemspider.com/Chemical-Structure." + csIdStr + ".html"));

          // Call ChemSpider REST API for common name
          const url = "https://api.rsc.org/compounds/v1/records/" + csIdStr + "/details?fields=CommonName";
          const options = {
            method: "GET",
            headers: {
              "apikey": "xSkGq4YGgRp5Bx2pPfbRhwgCq9rSz9pM",
              "Accept": "application/json"
            },
          };

          fetch(url, options).then(
            response => {
              if (response.ok) {
                return response.text();
              }
              return response.text().then(err => {
                return Promise.reject({
                  status: response.status,
                  statusText: response.statusText,
                  errorMessage: err,
                });
              });
            })
            .then(data => {
              props.change('molName', (JSON.parse(data)).commonName);
            })
            .catch(err => {
              console.error(err);
              props.change('molName', "");
            });
        }
        else{
          props.change('molUrl', "");
          props.change('molName', "");
        }
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group widths="equal">
        <Form.Field>
          <label>Background Color:</label>
          <Field
            fluid
            name="options.bkgCol"
            component={inputTrad}
            type="color"
          />
        </Form.Field>
        <Form.Field>
          <label>Text Color:</label>
          <Field
            fluid
            name="options.txtCol"
            component={inputTrad}
            type="color"
          />
        </Form.Field>
      </Form.Group>

      <hr />

      <Form.Field>
        <label>MOL File String: (Paste text or <Button as="label" htmlFor="file" type="button" color="blue" style={{fontSize: "14px", padding: "4px", fontWeight: "bold", height: "22px", marginLeft: "5px"}}>Load File</Button>) [Use <a target='_blank' href='http://www.chemspider.com'>ChemSpider</a> for best support]</label>
        <Field
          fluid
          name="molStr"
          component={TextArea}
          placeholder="CT1000292221
            3  2  0  0  0               999 V2000
              0.0021   -0.0041    0.0020 H   0  0  0  0  0  0  0  0  0  0  0  0
            -0.0110    0.9628    0.0073 O   0  0  0  0  0  0  0  0  0  0  0  0
              0.8669    1.3681    0.0011 H   0  0  0  0  0  0  0  0  0  0  0  0
            1  2  1  0  0  0  0
            2  3  1  0  0  0  0
          M  END
          "
        />
        <input type="file" id="file" style={{ display: "none" }} onChange={fileChange} />
      </Form.Field>

      {/* validate={[ errorValidate ]} onChange={onCMChange}*/}
      <Form.Field>
        <label>Chemical Name:</label>
        <Field
          fluid
          name="molName"
          component={Input}
          placeholder="Water"
        />
      </Form.Field>

      <Form.Field>
        <label>Chemical Formula:</label>
        <Field
          fluid
          name="molForm"
          component={Input}
          placeholder="H2O"
        />
      </Form.Field>

      <Form.Field>
        <label>Further Details URL:</label>
        <Field
          fluid
          name="molUrl"
          component={Input}
          placeholder="https://www.molinstincts.com/sdf-mol-file/water-sdf-CT1000292221.html"
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

export default reduxForm({
  form: 'Molecule3D',
})(Molecule3DForm);
