/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the
//              'FeatureEngineering' module
// ------------------------------------------------------------------------------------------------
// Notes: 'FeatureEngineering' is a component that makes amazing things.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party jquery, internal support methods fr. VisCompUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import { Button, Header, Grid, GridRow, Modal, ModalActions, ModalContent, Table } from 'semantic-ui-react'
import PropTypes from "prop-types";

import $ from "jquery";

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Empty Feature Engineering",
  extent: { width: 400, height: 200 },
};

//--------------------------------------------------------------------------------------------------
//Format culcurated data from python
const transposeData = (data) => {
  const fields = Object.keys(data);
  const valuesLength = Object.values(data)[0].length;
  const transposedData = [];

  for (let i = 0; i < valuesLength; i++) {
    const rowData = fields.map(field => data[field][i]);
    transposedData.push(rowData);
  }
  // console.log('headers', fields)
  // console.log('content',transposedData)

  return { headers: fields, data: transposedData };
};

//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function FeatureEngineering({
  data,
  mappings,
  options,
  originalOptions,
  id,
}) {


  const [disabled, setdisabled] = useState(true);
  const [open, setOpen] = useState(false);
  const [dataT, setDataT] = useState({})
  // Initiation of the VizComp
  let internalOptions = {...defaultOptions, ...options};

  //Buttun Clicked Funtuion
  const downloadButtonClick = (e, data) => {
    const headersCSV = dataT['headers'].join(',') + '\n';
    const dataCSV = dataT['data'].map(row => row.join(',')).join('\n');

    const datasetCSV = headersCSV + dataCSV
    
    //fileName
    const fileName = "Feature_Engineering.csv";

    //Download 
    const link = document.createElement("a");
    link.setAttribute("href", 'data:text/csv;charset=utf-8,' + encodeURIComponent(datasetCSV));
    link.setAttribute("target", "_blank");
    link.setAttribute("download", fileName);
    link.click();
    try {
      document.body.removeChild(link)
    } catch (error) {}
  }

  // Create the VizComp based on the incomming parameters
  const createChart = () => {
    if (data.data) {
      setdisabled(false);
      setDataT(transposeData(data.data));
    }
  };

   // Clear away the VizComp
   const clearChart = () => {
    /* Called when component is deleted */
  };

  // Only called at init and set our final exit function
  useEffect(() => {
    return () => { clearChart(); };
  }, []);

  // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
  }, [data, options]);

  // Add the VizComp to the DOM
  return (
    <div style={{width: internalOptions.extent.width, height: internalOptions.extent.height,  maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box', textAlign: 'center' }}>
      <Header as='h2' style={{ marginBottom: '20px' }}>Feature Engineering</Header>
      <Grid centered >
        <GridRow >
            <Button 
              positive
              disabled={disabled}
              onClick={(e, data) => {downloadButtonClick(e, data)}}
              csvdata = {data}
            >Download
            </Button>
        </GridRow>
        <GridRow>
          <Modal
            basic
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={<Button 
                      positive
                      disabled={disabled}
                      >View
                    </Button>}
            centered
            size="fullscreen"
          >
            <ModalContent  scrolling>
              <ViewTable dataset = {dataT}/>
            </ModalContent>
            <ModalActions>
              <Button negative onClick={() => setOpen(false)}>Close</Button>
            </ModalActions>
          </Modal>
        </GridRow>
      </Grid> 
      {/* <div> Run Time : {data.Run_Time}</div> */}
    </div>
  );
}
//-------------------------------------------------------------------------------------------------

const ViewTable = ({dataset}) => {
  const { headers, data } = dataset
  return (
    <div>
      <Table celled>
        <Table.Header>
          <Table.Row>
            {headers.map((header, index) => (
              <Table.HeaderCell key={index}>{header}</Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((row, rowIndex) => (
            <Table.Row key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <Table.Cell key={cellIndex}>{cell}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )

}

//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
FeatureEngineering.propTypes = {
  data: PropTypes.shape({ }),
  options: PropTypes.shape({
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),
  }),
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
FeatureEngineering.defaultProps = {
  data: {},
  options: defaultOptions,
};
//-------------------------------------------------------------------------------------------------
