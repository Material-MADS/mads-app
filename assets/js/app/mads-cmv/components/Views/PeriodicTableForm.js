import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form } from 'semantic-ui-react';

const PeriodicTableForm = (props) => {
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

  return (
    <Form onSubmit={handleSubmit}>
      <div>This Form is not used</div>
    </Form>
  );
};

export default reduxForm({
  form: 'PeriodicTable',
})(PeriodicTableForm);
