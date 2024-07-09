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
import { Button, Header, Grid, GridRow, Modal, ModalActions, ModalContent, ModalHeader ,Table, GridColumn, Image, Popup } from 'semantic-ui-react'
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import $ from "jquery";

import csvinput from './images/featureEngineering/csvinput.png';
import csvoutput from './images/featureEngineering/csvoutput.png';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Empty Feature Engineering",
  extent: { width: 400, height: 300 },
};

//-------------------------------------------------------------------------------------------------
// The function which download csv File
const csvDownload = (csvData, fileName) => {
  //Download 
  const link = document.createElement("a");
  link.setAttribute("href", 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
  link.setAttribute("target", "_blank");
  link.setAttribute("download", fileName);
  link.click();
  try {
    document.body.removeChild(link)
  } catch (error) {}

}

// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function FeatureEngineering({
  data,
  options,
  id,
}) {
  const [disabled, setdisabled] = useState(true);
  const [open, setOpen] = useState(false); //manage Modal of Reault data
  const [currentDataSource, setCurrentDataSource] = useState({id: '', name: ''}); //manage data souerce change
  // Initiation of the VizComp
  let internalOptions = {...defaultOptions, ...options};

  try {
    const availableDataSources = useSelector((state) => state.dataSources);
    if (availableDataSources.selectedDataSource != currentDataSource.id) {
      if(currentDataSource.id != '') {
        setdisabled(true);
      }
      setCurrentDataSource({id: availableDataSources.selectedDataSource, name: ((availableDataSources.items.find(item => availableDataSources.selectedDataSource == item.id)).name)})
    }
  } catch (error) { /*Just ignore and move on*/ }

  //Buttun Clicked Funtuion
  const downloadButtonClick = (e, value) => {
    //generate csv dataset
    let csv = data.header.join(',') + '\n';
    Object.keys(data.data).forEach(key => {
      csv += data.data[key].join(',') + '\n';
      });
    // console.log(csv)
    
    //fileName
    const fileName =  'Feature_Engineering'
    // console.log(fileName)

    csvDownload(csv, fileName);
  }

  const baseDesctriptorsButtonClick = (e, data) => {
    const { basedescriptors } = data 
    if (basedescriptors && basedescriptors.length !== 0) {
      const csvData = basedescriptors.join(',');
      const fileName = 'base_descriptors.csv';
      csvDownload(csvData, fileName);
    }

  }

  // Create the VizComp based on the incomming parameters
  const createChart = () => {
    if (data.data && data.base_descriptors && data.base_descriptors !== 0) {
      setdisabled(false);
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
    <div style={{width: internalOptions.extent.width, height: internalOptions.extent.height, overflow: 'hidden', boxSizing: 'border-box'}}>
      <Header as='h2' style={{margin:'15px auto 30px auto', textAlign:'center'}}>Feature Engineering( id: {id})</Header>
      <Grid centered >
        <GridRow columns={3} centered>
          <GridColumn textAlign={'center'} verticalAlign={"middle"}>
            <Header as='h4'>Result Data</Header>
          </GridColumn>
          <GridColumn textAlign={'justified'} verticalAlign={"middle"}>
            <Button 
              disabled={disabled}
              onClick={(e, value) => {downloadButtonClick(e, value)}}
              csvdata = {data}
            >Download
            </Button>
          </GridColumn>
          <GridColumn textAlign={'justified'} verticalAlign={"middle"} >
            <Modal
              basic
              onClose={() => setOpen(false)}
              onOpen={() => setOpen(true)}
              open={open}
              trigger={<Button 
                        disabled={disabled}
                        >View
                      </Button>}
              centered
              size="fullscreen"
            >
              <ModalContent  scrolling>
                <ViewTable dataset = {data}/>
              </ModalContent>
              <ModalActions>
                <Button negative onClick={() => setOpen(false)}>Close</Button>
              </ModalActions>
            </Modal>
          </GridColumn>
        </GridRow>
        <GridRow columns={2} centered>
          <GridColumn textAlign={'center'} verticalAlign={"middle"} >
            <Header as='h4' style={{ display: 'inline-block' }}>Base Descriptors <Popup trigger={<span style={{fontSize: "20px", color: "blue", display: 'inline'}}>ⓘ</span>} content='In this csv file, feature columns list is included. Download this csv file if you use "MonteCat." ' size='mini' /></Header>
          </GridColumn>
          <GridColumn textAlign={'justified'} verticalAlign={"middle"}>
            <Button 
              disabled={disabled}
              onClick={(e, data) => {baseDesctriptorsButtonClick(e, data)}}
              basedescriptors = {data.base_descriptors}
            >Download
            </Button>
          </GridColumn>
          <GridColumn />
        </GridRow>
      </Grid>
      <div>Feature Engineering id : {id}</div>
      <CSVFileModal image={csvinput} title={'Input CSV File Data Requirements Format'} attr={'#inputcsvfile' + id}/>
      <CSVFileModal image={csvoutput} title={'Output CSV File Data Format'} attr={'#outputcsvfile' + id}/>
    </div>
  );
}
//-------------------------------------------------------------------------------------------------

//Modal component of csv file format and csv file output
const CSVFileModal = ({image, title, attr}) => {
  const [open, setOpen] = useState(false);
  const rootNode = useRef(null);

  useEffect(() => {
    const viewWrapperCustomButton = $(rootNode.current).parent().parent().parent().find(attr);
    viewWrapperCustomButton.off('click');
    viewWrapperCustomButton.on( "click", function () {
      setOpen(true);
    })
    return () => { viewWrapperCustomButton.off('click'); }
  }, [])

  return (
    <div>
      <Modal
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        // trigger={<Button size="mini" style={{margin:'15px 0.5em 30px 0px'}} color='red'>ⓘ</Button>}
        centered
        size="large"
      >
        <ModalHeader >{title}</ModalHeader>
        <ModalContent image style={{ display: 'flex', justifyContent: 'center' }}>
          <Image size='huge' src={image} wrapped />
        </ModalContent>
        <ModalActions>
          <Button negative onClick={() => setOpen(false)}>Close</Button>
        </ModalActions>
      </Modal>
      <div ref={rootNode} />
    </div>
  )
}

//This is a component which show result data as table
//This is a component which show result data as table
const ViewTable = ({dataset}) => {
  // console.log(dataset)
  const { header, data } = dataset
  return (
    <div>
      <Table celled compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>#</Table.HeaderCell>
            {header.map((cell, index) => (
              <Table.HeaderCell key={index}>{cell}</Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.keys(data).map((key) => (
            <Table.Row key={key}>
              <Table.Cell>{key}</Table.Cell>
              {data[key].map((cell, cellIndex) => (
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
  descriptorColumns: PropTypes.array,
  targetColumns: PropTypes.array,
  firstOrderDescriptors: PropTypes.array,
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
  descriptorColumns: [],
  targetColumns: [],
  firstOrderDescriptors: [],
  options: defaultOptions,
};
//-------------------------------------------------------------------------------------------------
