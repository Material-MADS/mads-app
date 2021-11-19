import React from 'react';

const DevStage = ({ stage, version }) => (
  <div style={{ display: 'inline' }}>
    {(stage != undefined && stage != "" && stage != "Stable Release") &&
      <span style={{ border: 'solid black 1px', backgroundColor: 'orange', color: 'blue', fontWeight: 'bold', borderRadius: '20px', paddingLeft: "4px", paddingRight: "4px", paddingTop: "2px", paddingBottom: "2px", textAlign: "center" }}>{stage}</span>
    }
    {(version != undefined && version != 1) &&
      <span style={{ border: 'solid black 0px', backgroundColor: 'transparent', color: 'black', fontWeight: 'bold', paddingLeft: "4px", textAlign: "center" }}>[v.{version.toFixed(2)}]</span>
    }
  </div>
)

export default DevStage;
