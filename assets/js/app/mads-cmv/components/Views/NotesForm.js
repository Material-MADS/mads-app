/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q2 2026
=================================================================================================*/

import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Popup } from 'semantic-ui-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';

import { getDropdownOptions } from './FormUtils';

const noteTypeOptions = [
  'None',
  'Observation',
  'Hypothesis',
  'Conclusion',
  'Warning',
  'TODO',
];

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'bullet' }, { list: 'ordered' }],
    ['link'],
    ['clean'],
  ],
};

const quillFormats = [
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
  'link',
];

const getCurrentTimestamp = () => {
  return new Date().toLocaleString();
};

const RichTextField = ({ input, onContentModified }) => (
  <ReactQuill
    theme="snow"
    value={input.value || ''}
    onChange={(value) => {
      input.onChange(value);
      onContentModified();
    }}
    modules={quillModules}
    formats={quillFormats}
    placeholder="Write notes, observations, hypotheses, conclusions, warnings, TODOs, links..."
  />
);

const ensureDefaultOptions = (initialValues, defaultOptions) => {
  initialValues.options = {
    ...defaultOptions,
    ...(initialValues.options || {}),
  };

  if (!initialValues.options.noteType) {
    initialValues.options.noteType = 'None';
  }

  if (!initialValues.options.noteColor) {
    initialValues.options.noteColor = '#FFF7CC';
  }

  if (initialValues.options.signature === undefined) {
    initialValues.options.signature = '';
  }

  if (initialValues.options.title === undefined) {
    initialValues.options.title = '';
  }

  if (initialValues.options.content === undefined) {
    initialValues.options.content = '';
  }

  if (!initialValues.options.created) {
    initialValues.options.created = getCurrentTimestamp();
  }

  if (initialValues.options.modified === undefined) {
    initialValues.options.modified = '';
  }
};

const NotesForm = (props) => {
  const {
    handleSubmit,
    initialValues,
    defaultOptions,
    change,
  } = props;

  ensureDefaultOptions(initialValues, defaultOptions);

  const created = initialValues.options.created || 'Automatically set when note is created';
  const modified = initialValues.options.modified || 'Automatically updated when note content changes';

  const updateModified = () => {
    change('options.modified', getCurrentTimestamp());
  };

  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>
          Title{' '}
          <Popup
            trigger={<span style={{ fontSize: '16px', color: 'blue' }}>ⓘ</span>}
            content="Optional title displayed at the top of the note."
            size="small"
          />
        </label>
        <Field
          name="options.title"
          component={inputTrad}
          type="text"
          placeholder="Note title"
        />
      </Form.Field>

      <Form.Field>
        <label>
          Note Type{' '}
          <Popup
            trigger={<span style={{ fontSize: '16px', color: 'blue' }}>ⓘ</span>}
            content="Optional note category. This does not control the note color."
            size="small"
          />
        </label>
        <Field
          name="options.noteType"
          placeholder="Select note type"
          component={SemanticDropdown}
          options={getDropdownOptions(noteTypeOptions)}
        />
      </Form.Field>

      <Form.Field>
        <label>
          Note Color{' '}
          <Popup
            trigger={<span style={{ fontSize: '16px', color: 'blue' }}>ⓘ</span>}
            content="User-selected note background color. Independent from note type."
            size="small"
          />
        </label>
        <Field
          name="options.noteColor"
          component={inputTrad}
          type="color"
        />
      </Form.Field>

      <Form.Field>
        <label>Text Color</label>
        <Field
          name="options.textColor"
          component={inputTrad}
          type="color"
        />
      </Form.Field>

      <Form.Field>
        <label>
          Signature{' '}
          <Popup
            trigger={<span style={{ fontSize: '16px', color: 'blue' }}>ⓘ</span>}
            content="Optional manually entered signature. Not connected to the CADS login account."
            size="small"
          />
        </label>
        <Field
          name="options.signature"
          component={inputTrad}
          type="text"
          placeholder="Optional signature"
        />
      </Form.Field>

      <Form.Field>
        <label>Content</label>
        <Field
          name="options.content"
          component={RichTextField}
          onContentModified={updateModified}
        />
      </Form.Field>

      <Form.Field>
        <label>Created</label>
        <input value={created} readOnly />
      </Form.Field>

      <Form.Field>
        <label>Modified</label>
        <input value={modified} readOnly />
      </Form.Field>

      <Field name="options.created" component="input" type="hidden" />
      <Field name="options.modified" component="input" type="hidden" />

      <hr />

      <Form.Group widths="equal">
        <label>Extent:</label>
        <Field fluid name="options.extent.width" component={Input} placeholder="Width" />
        <Field fluid name="options.extent.height" component={Input} placeholder="Height" />
      </Form.Group>

    </Form>
  );
};

export default reduxForm({
  form: 'Notes',
})(NotesForm);
