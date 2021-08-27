import React from 'react';

const TextArea = ({ input, label, placeholder, meta: { touched, error, warning } }) => (
  <div>
    <label>{label}</label>
       <div>{JSON.stringify(error)}</div>
    <div>
      <textarea {...input} placeholder={placeholder} ></textarea>
      {touched &&
        ((error && <span><i style={{ color: '#9f3a38', fontWeight: 'bold' }}>{error}</i></span>) ||
          (warning && <span><i style={{ color: '#e07407', fontWeight: 'bold' }}>{warning}</i></span>))}
    </div>
  </div>
)

export default TextArea;
