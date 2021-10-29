import React from 'react';

const DevStage = ({ stage }) => (
  <div style={{ display: 'inline', border: 'solid black 1px', backgroundColor: 'orange', color: 'blue', fontWeight: 'bold', borderRadius: '20px', paddingLeft: "4px", paddingRight: "4px", paddingTop: "2px", paddingBottom: "2px", textAlign: "center" }}>
    <span>{stage}</span>
  </div>
)

export default DevStage;
