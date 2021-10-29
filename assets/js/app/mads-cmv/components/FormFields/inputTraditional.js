import React from 'react';

const inputTrad = ({ input, label, type, meta: { touched, error, warning }, value }) => (
  <div>
    <label>{label}</label>
    <div>{JSON.stringify(error)}</div>
    <div>
      <input
        {...input}
        placeholder={label}
        type={type}
      />
      {touched &&
        ((error && <span><i style={{ color: '#9f3a38', fontWeight: 'bold' }}>{error}</i></span>) ||
          (warning && <span><i style={{ color: '#e07407', fontWeight: 'bold' }}>{warning}</i></span>))}
    </div>
  </div>
)

export default inputTrad;
