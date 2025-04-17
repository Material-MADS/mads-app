/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Wrapper Container for all Views that holds the different VisComps
// ------------------------------------------------------------------------------------------------
// Notes: 'ViewWrapper' is the View manager / controller that holds each various VisComp View
//        and gives us the needed interface to remove or edit the VisComp.
// ------------------------------------------------------------------------------------------------
// References: react, prop-types and semantic-ui-react libs, Needed FormField components
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Popup,  ModalHeader, ModalDescription, ModalContent, ModalActions, Header, Image, Icon } from 'semantic-ui-react';

import DevStage from '../FormFields/DevStage';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ViewWrapper Package
//-------------------------------------------------------------------------------------------------
export default function withCommandInterface(
  WrappedComponent,
  SettingForm,
  settings = {},
  properties = {}
) {

  const AboutInfoModal = ({compName, description, manual, devInfo, superInfo, academicInfo}) => {
    const [open, setOpen] = React.useState(false)

    const theDescription = description != "" ? description : "No description provided for this component";

    const TheDeveloper = () => {
      if (devInfo.length == 1) {
        return (<p style={{marginLeft: "10px", fontFamily: "Georgia", fontWeight: "bold", fontSize: "18px"}}>{devInfo[0].name} <span style={{fontSize: "16px"}}>({devInfo[0].affiliation}) <a href={devInfo[0].link} target="_blank" style={{marginLeft: "7px"}}><Icon name='eye' /></a></span></p>);
      }
      else if (devInfo.length > 1) {
        return (<ul>{devInfo.map((di,index)=>{
          return <li style={{fontFamily: "Georgia", fontWeight: "bold", fontSize: "18px"}} key={index}>{di.name} <span style={{fontSize: "16px"}}>({di.affiliation}) <a href={di.link} target="_blank" style={{marginLeft: "7px"}}><Icon name='eye' /></a></span></li>
        })}</ul>);
      }
      else{
        return (<p style={{marginLeft: "10px", fontFamily: "Georgia", fontWeight: "normal", fontSize: "15px"}}>This Developer has Decided to Remain Anonymous</p>);
      }
    };

    const TheManual = () => {
      if (manual != "") {
        return (<p style={{marginLeft: "10px", fontFamily: "Georgia", fontWeight: "bold", fontSize: "16px"}}><a href={manual} target="_blank" style={{marginLeft: "7px"}}>{compName} Online Manual <Icon name='eye' /></a> </p>);
      }
      else{
        return (<p style={{marginLeft: "10px", fontFamily: "Georgia", fontWeight: "normal", fontSize: "15px"}}>No Additional Manual Required</p>);
      }
    };

    const TheSupervisors = () => {
      if (superInfo.length == 1) {
        return (<div><ModalDescription><Header>Under the Supervision and Guiding Hand of</Header><p style={{marginLeft: "10px", fontFamily: "Garamond", fontWeight: "bold", fontSize: "16px"}}>{superInfo[0].name} <span style={{fontSize: "14px"}}>({superInfo[0].affiliation}) <a href={superInfo[0].link} target="_blank" style={{marginLeft: "7px"}}><Icon name='eye' /></a></span></p></ModalDescription><hr/><br/></div>);
      }
      else if (superInfo.length > 1) {
        return (<div><ModalDescription><Header>Under the Supervision and Guiding Hand of</Header><ul>{superInfo.map((si,index)=>{
          return <li style={{fontFamily: "Garamond", fontWeight: "normal", fontSize: "16px"}} key={index}>{si.name} <span style={{fontSize: "14px"}}>({si.affiliation}) <a href={si.link} target="_blank" style={{marginLeft: "7px"}}><Icon name='eye' /></a></span></li>
        })}</ul></ModalDescription><hr/><br/></div>);
      }
      else{
        return (<span></span>);
      }
    };

    const TheAcademicInfo = () => {
      if (academicInfo.length > 0) {
        return (<ul>{academicInfo.map((ai,index)=>{
          return <li style={{fontSize: "16px", fontStyle: "italic", fontWeight: "bold"}} key={index}>{ai.title} <a href={ai.link} target="_blank" style={{marginLeft: "7px"}}><Icon name='eye' /></a></li>
        })}</ul>);
      }
      else{
        return (<p style={{marginLeft: "10px", fontSize: "16px", fontStyle: "italic", fontWeight: "bold"}}>No Academic Papers has yet been published in relation to this Component</p>);
      }
    };

    return (
      <Modal
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        trigger={<div style={{float: "right", marginRight: "4px" }}>
        <label>
          <Popup trigger={<span style={{fontSize: "14px", color: "blue"}}>ⓘ</span>} size='small' wide='very'><p>About {compName}</p></Popup>
        </label>
      </div>}
      >
        <ModalHeader>About {compName}</ModalHeader>
        <ModalContent>
          <ModalDescription>
            <Header>Description</Header>
            <p style={{marginLeft: "10px"}}>{theDescription}</p>
          </ModalDescription>
          <hr/><br/>
          <ModalDescription>
            <Header>Component Manual</Header>
            <TheManual />
          </ModalDescription>
          <hr/><br/>
          <ModalDescription>
            <Header>This Component was Developed by</Header>
            <TheDeveloper />
          </ModalDescription>
          <hr/><br/>
          <TheSupervisors />
          <ModalDescription>
            <Header>Related Academic Papers</Header>
            <TheAcademicInfo />
          </ModalDescription>
        </ModalContent>
        <ModalActions>
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        </ModalActions>
      </Modal>
    )
  }

  // The ViewWrapper Class
  class ViewWrapper extends React.Component {

    componentDidMount() {
      if(this.props.view.settings.isDupli){
        this.props.view.settings.isDupli = false;
        try {
          this.handleSubmit(this.props.view.settings);
        } catch (error) {
          // No need to do something, just dont try again with this one
        }
      }

      if(this.props.devStage != 'Stable Release'){
        this.props.actions.showMessage({
          header: 'STILL UNDER DEVELOPMENT',
          content: 'This component (' + this.props.view.name + ') is still in development and might change a lot before it is released. It is only available in ' + this.props.devStage + ' state and should only be used for testing and not in production.',
          type: 'warning',
        });
      }
    }

    state = {
      propSheetOpen: false,
    };

    show = () => {
      this.setState({ propSheetOpen: true });
    };

    close = () => {
      this.setState({ propSheetOpen: false });
    };

    getColumnOptions = () => {
      const { dataset } = this.props;
      const { main } = dataset;

      let columnOptions = [];

      // collect options from the main dataset
      if (main.schema) {
        columnOptions = main.schema.fields.map((f) => ({
          key: f.name,
          text: f.name,
          value: f.name,
        }));
      }

      // collect options from views
      const keys = Object.keys(dataset);

      keys.forEach((k) => {
        if (k === 'main') {
          return;
        }
      });

      return columnOptions;
    };

    getColumnOptionArray = () => {
      const { dataset } = this.props;
      const { main } = dataset;

      let columnOptions = [];
      if (main.schema) {
        columnOptions = main.schema.fields.map((f) => f.name);
      }
      return columnOptions;
    };

    getSelection = (selection) => {
      // Note: override this if necessary
      return selection;
    };

    handleModelSave = (name, overwrite, id) => {
      // Note: override this if necessary
    };

    handleSelectionChange = (indices) => {
      // Note: override this if needed
      const { updateSelection } = this.props;

      updateSelection(indices);
    };

    handleSubmit = (values) => {
      // Note: override this if necessary or more exactly... "handleSubmit" needs to be overridden.
      console.error('"handleSubmit" needs to be overridden.');
    };

    mapData = (dataset) => {
      // Note: override this if you want to have special mappings of data
      return dataset.main.data;
    };

    onSubmitClick = () => {
      this.formReference.submit();

      this.close();
    };

    onDeleteClick = (id) => {
      this.props.removeView(id);
    };

    onDuplicateClick = (id, view) => {
      this.props.duplicateView(id, view);
    };

    render() {
      const {
        dataset,
        removeView,
        view,
        id,
        selection,
        defaultOptions,
        customButtons,
        colorTags,
        isLoggedIn,
        showMessage,
        actions,
        getNewAvailableId,
        version,
        devStage,
        freeMobilityEnabled,
        devInfo,
        manual,
        superInfo,
        academicInfo,
        description
      } = this.props;

      const { main } = dataset;
      const { propSheetOpen } = this.state;
      const columnOptions = this.getColumnOptions();
      const data = this.mapData(dataset);
      const selectionInternal = this.getSelection(selection);

      const tellWSSomething = (msg) => {
        this.props.tellWSSomething(msg);
      };

      // compose filtered indices
      let filteredIndices = [];
      if (view.settings.filter) {
        view.settings.filter.forEach((f) => {
          const cTag = colorTags.find((c) => c.id === f);
          if (!cTag) {
            return;
          }
          filteredIndices = filteredIndices.concat(cTag.itemIndices);
        });

        const s = new Set(filteredIndices);
        filteredIndices = Array.from(s);
      }

      // Add the ViewWrapper to the DOM
      return (
        <div className="view-container">
          <Popup
            trigger={<Button size="mini" icon="remove" onClick={() => this.onDeleteClick(id)} />}
            content='Delete'
            // disabled
            size='small'
          />
          <Popup
            trigger={<Button size="mini" icon="configure" onClick={() => this.show()} />}
            content='Configure'
            size='small'
          />

          {freeMobilityEnabled && <Popup
            trigger={<Button className="the-drag-handle" size="mini" icon="arrows alternate" /> }
            content='Move'
            size='small'
          />}

          <Popup
            trigger={<Button size="mini" icon="copy"  onClick={() => this.onDuplicateClick(id, view)} style={{marginRight: '20px'}}/>}
            content='Duplicate'
            size='small'
          />
          {customButtons.map((cb,index)=>{
              if(cb.type == "color"){
                return <Popup key={index} trigger={<input id={cb.name+view.id} type='color' style={{width: "25px", marginLeft: "2px"}} defaultValue="#ff0000"></input>} content={cb.text} size='small' />
              }
              else if(cb.type == "number"){
                return <Popup key={index} trigger={<input id={cb.name+view.id} type='number' step={cb.step} min={cb.min || 0} max={cb.max || 100} style={{width: "40px", marginLeft: "2px"}} defaultValue={cb.defVal || 0}></input>} content={cb.text} size='small' />
              }
              else if(cb.type == "list"){
                return <Popup key={index} trigger={<select id={cb.name+view.id} defaultValue={cb.options[0].value}>{cb.options.map(o => (<option key={o.value} value={o.value}>{o.text}</option>))}</select>} content={cb.text} size='small' />
              }
              else{
                return <Popup key={index} trigger={<Button id={cb.name+view.id} className="ui custom-btn-color button" style={{border: '1px solid gray'}} size="mini" icon={cb.icon} />} content={cb.text} size='small' />
              }
          })}

          <DevStage stage={devStage} version={version} />

          <AboutInfoModal compName={view.name} description={description} devInfo={devInfo} manual={manual} superInfo={superInfo} academicInfo={academicInfo} />

          <WrappedComponent
            data={data || []}
            {...settings}
            {...view.settings}
            properties={view.properties}
            selectedIndices={selectionInternal}
            id={view.id}
            originalOptions={defaultOptions}
            colorTags={colorTags}
            filteredIndices={filteredIndices}
            onSelectedIndicesChange={(indices) =>
              this.handleSelectionChange(indices)
            }
            showMessage={actions.showMessage}
            isPropSheetOpen={propSheetOpen}
            actions={actions}
            tellWSSomething={tellWSSomething}
          />

          <Modal open={propSheetOpen} onClose={this.close} onMouseDown={ e => e.stopPropagation() }> {/* FORTEST: [onMouseDown={ e => e.stopPropagation() }] */}
            <Modal.Header>
              {view.name} {`[${view.id}]`}
            </Modal.Header>
            <Modal.Content>
              <SettingForm
                dataset={dataset}
                initialValues={view.settings}
                enableReinitialize
                defaultOptions={defaultOptions}
                ref={(form) => {
                  this.formReference = form;
                }}
                onSubmit={this.handleSubmit}
                columns={columnOptions}
                targetId={id}
                colorTags={colorTags}
                onModelSave={this.handleModelSave}
                isLoggedIn={isLoggedIn}
                actions={actions}
              />
            </Modal.Content>
            <Modal.Actions>
              <Button negative onClick={() => this.close()}>
                Cancel
              </Button>
              <Button positive content="Submit" onClick={this.onSubmitClick} />
            </Modal.Actions>
          </Modal>
        </div>
      );
    }
  }

  ViewWrapper.propTypes = {
    dataset: PropTypes.object.isRequired,
  };

  return ViewWrapper;
}
//-------------------------------------------------------------------------------------------------
