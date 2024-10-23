/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ____________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the
//              'MonteCat' module
// ------------------------------------------------------------------------------------------------
// Notes: 'MonteCat' is a component that makes amazing things.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party jquery, internal support methods fr. VisCompUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import $ from "jquery";
import { Button, Header, Grid, GridRow, Modal, ModalActions, ModalContent, ModalHeader ,Table, GridColumn, Image} from 'semantic-ui-react'
import { useSelector } from "react-redux";

import csvinput from './images/monteCat/csvinput.png';
import csvoutput from './images/monteCat/csvoutput.png';


//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Empty 'MonteCat' Component",
  extent: { width: 400, height: 200 },
};

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function MonteCat({
  data,
  options,
  temperature,
  machineLearningModel,
  id,
}) {
  const [disabled, setdisabled] = useState(true);
  const [currentDataSource, setCurrentDataSource] = useState({id: '', name: ''}); //manage data souerce change
  const rootNode = useRef(null);

  // Initiation of the VizComp
  let internalOptions = {...defaultOptions, ...options};

  try {
    const availableDataSources = useSelector((state) => state.dataSources);
    // console.log(availableDataSources)
    if (availableDataSources.selectedDataSource != currentDataSource.id) {
      if(currentDataSource.id != '') {
        // setdisabled(true);
      }
      setCurrentDataSource({id: availableDataSources.selectedDataSource, name: ((availableDataSources.items.find(item => availableDataSources.selectedDataSource == item.id)).name)})
    }
  } catch (error) { /*Just ignore and move on*/ }

  // Create the VizComp based on the incomming parameters
  const createChart = () => {
    if (data['output'] && data['process']) {
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
      <Header as='h2' style={{margin:'15px auto 30px auto', textAlign:'center'}}>Monte Cat</Header>
      <DataItemActions data={data['process']} content='Process Result' disabled={disabled} filename='montecat_process'/>
      <DataItemActions data={data['output']} content='Best Model' disabled={disabled} filename={`${machineLearningModel}_T${temperature}`}/>
      <CSVFileModal image={csvinput} title={'Input CSV File Data Requirements Format'} attr={'#inputcsvfile' + id}/>
      <CSVFileModal image={csvoutput} title={'Output CSV File Data Format'} attr={'#outputcsvfile' + id}/>
      <div ref={rootNode} />
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

//Dawnload and view button Component
const DataItemActions = ({data, content, disabled, filename}) => {
  const [open, setOpen] = useState(false);

  //Buttun Clicked Funtuion
  const downloadButtonClick = (e, value) => {
    const {filename} = value

    //generate csv dataset
    let csv = data.header.join(',') + '\n';
    Object.keys(data.data).forEach(key => {
      csv += data.data[key].join(',') + '\n';
      });
    // console.log(csv)

    //Download
    const link = document.createElement("a");
    link.setAttribute("href", 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    link.setAttribute("target", "_blank");
    link.setAttribute("download", filename);
    link.click();
    try {
      document.body.removeChild(link)
    } catch (error) {}
  }

  return (
    <Grid >
      <GridRow columns={3} centered>
        <GridColumn textAlign={'center'} verticalAlign={"middle"}>
          <Header as='h4'>{content}</Header>
        </GridColumn>
        <GridColumn textAlign={'justified'} verticalAlign={"middle"}>
          <Button
            disabled={disabled}
            onClick={(e, value) => {downloadButtonClick(e, value)}}
            filename = {filename}
          >Download
          </Button>
        </GridColumn>
        <GridColumn textAlign={'justified'} verticalAlign={"middle"}>
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
    </Grid>
  )
}

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
MonteCat.propTypes = {
  data: PropTypes.shape({}),
  selectedDataSource: PropTypes.string,
  featureEngineeringId: PropTypes.string,
  machineLearningModel: PropTypes.string,
  targetColumn: PropTypes.string,
  descriptorsFileName: PropTypes.string,
  baseDescriptors: PropTypes.array,
  featureEngineeringDS: PropTypes.shape({}),
  randomSeed: PropTypes.bool,
  temperature: PropTypes.number,
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
MonteCat.defaultProps = {
  data: {},
  selectedDataSource: 'Data Management',
  baseDescriptors: [],
  featureEngineeringDS: {},
  featureEngineeringId: '',
  machineLearningModel: '',
  temperature: 0,
  targetColumn: '',
  descriptorsFileName: "Nothing loaded.",
  randomSeed: false,
  options: defaultOptions,
};
//-------------------------------------------------------------------------------------------------
