/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of a custom 'Development Stage Info' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'DevStage' is a custom info display component using colors and text to show the
//        development stage value for a specific Visualization Component (e.g. 'Beta' etc).
// ------------------------------------------------------------------------------------------------
// References: React Lib
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The FormField Component
//-------------------------------------------------------------------------------------------------
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
//-------------------------------------------------------------------------------------------------

export default DevStage;
