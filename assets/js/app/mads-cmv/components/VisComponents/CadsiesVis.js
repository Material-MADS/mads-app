/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the
//              'Cadsies - Custom Mini App' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Cadsies - Custom Mini App' is a component that makes amazing things.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party jquery, internal support methods fr. VisCompUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import './CadsiesVisStyles.css';
import { rgbToHex } from './VisCompUtils';

import $ from "jquery";

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Component Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Empty 'Cadsies - Custom Mini App' Component",
  extent: { width: 98, height: 68 },
  extentUnit: { width: 'vw', height: 'vh' },
};

const sampleDemoData = {data: [
  {
      index: 0,
      elemParam: '{"backgroundColor": "red", "width": "50px", "height": "50px", "text": ""}',
      objParam: '{"numericalValue": 42, "boolValue": false, "stringValue":"Welcome Dr. Falken", "info":"sampleDemoData"}'
  },
  {
      index: 1,
      elemParam: '{"backgroundColor": "pink", "width": "50px", "height": "70px", "fontSize": "11px", "text": "GOLDEN", "color": "yellow"}',
      objParam: '{"info":"sampleDemoData"}'
  },
  {
      index: 2,
      elemParam: '{"backgroundColor": "purple", "width": "50px", "height": "50px", "text": ""}',
      objParam: '{"numericalValue": 19, "boolValue": true, "info":"sampleDemoData"}'
  },
]};

let thisComponent = {};

//-------------------------------------------------------------------------------------------------
var wsProxy;

//-------------------------------------------------------------------------------------------------
// Component Support Functions
//-------------------------------------------------------------------------------------------------
//===========================
function CamelToSnake(string) {
  return string.replace(/([a-z]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};
//===========================


//===========================
function startDrag(event, rootNode, id) {
  const originalElement = $(rootNode.current).find(event.target);
  if (!originalElement.hasClass('draggable') || event.which === 3) {
    return;
  }

  const containerOffset = $(rootNode.current).find('#largerArea_'+id).offset();
  const offsetX = originalElement.width() / 2;
  const offsetY = originalElement.height() / 2;

  // Create a ghost element
  const ghostElement = originalElement.clone();
  $(rootNode.current).append(ghostElement);

  var verticalScrollbarValue = document.documentElement.scrollTop || document.body.scrollTop;

  ghostElement.css({
    position: 'absolute',
    left: event.clientX - offsetX + 'px',
    top: event.clientY - offsetY + verticalScrollbarValue + 'px',
    opacity: 0.5,
    pointerEvents: 'none',
  });

  $(rootNode.current).on('mousemove', moveGhost);
  $(rootNode.current).on('mouseup', handleMouseUp);

  function moveGhost(event) {
    ghostElement.css({
      left: event.clientX - offsetX + 'px',
      top: event.clientY - offsetY + verticalScrollbarValue + 'px',
    });
  }

  function handleMouseUp(event) {
    $(rootNode.current).off('mousemove', moveGhost);
    $(rootNode.current).off('mouseup', handleMouseUp);
    ghostElement.remove();

    // Check if the drop location is within the larger area
    const dropLocation = document.elementFromPoint(event.clientX, event.clientY);
    if (dropLocation && dropLocation.id === 'largerArea_'+id) {
      // If dropped over the larger area, create a proper duplicate
      const duplicate = originalElement.clone();
      $(rootNode.current).find('#largerArea_'+id).append(duplicate);

      // Assign a unique ID to the duplicated element
      const objectId = `object${thisComponent[id].objectIdCounter++}`;
      duplicate.attr('id', objectId);

      var verticalScrollbarValue = document.documentElement.scrollTop || document.body.scrollTop;

      duplicate.css({
        position: 'absolute',
        left: event.clientX - containerOffset.left - offsetX + 'px',
        top: event.clientY - containerOffset.top - offsetY + verticalScrollbarValue + 'px',
      });

      duplicate.addClass('tooltip');
      duplicate.html(`<span class="tooltiptext">${objectId}</span>`+duplicate.html());

      duplicate.on('contextmenu', function (event) { showContextMenu(event, duplicate, rootNode, id); });

      saveWS(rootNode, id);
    }
  }
}
//===========================


//===========================
function moveAt(event, rootNode, id) {
  if (thisComponent[id]["draggedElement"]) {
    const containerPosition = $(rootNode.current).find('#largerArea_'+id).position();
    const offsetX = thisComponent[id].draggedElement.width() / 2;
    const offsetY = thisComponent[id].draggedElement.height() / 2;

    var verticalScrollbarValue = document.documentElement.scrollTop || document.body.scrollTop;

    // Calculate the new position including margins
    const newLeft = event.clientX - offsetX - containerPosition.left;
    const newTop = event.clientY - offsetY - containerPosition.top + verticalScrollbarValue;

    // Check boundaries
    const maxX = $(rootNode.current).find('#largerArea_'+id).width() - thisComponent[id].draggedElement.width();
    const maxY = $(rootNode.current).find('#largerArea_'+id).height() - thisComponent[id].draggedElement.height();

    // Ensure the element stays within the boundaries (the value of 10 is not really properly located, but it currently does the trick)
    const boundedLeft = Math.max(0, Math.min(newLeft, maxX)) - 10;
    const boundedTop = Math.max(0, Math.min(newTop, maxY)) - 10;

    thisComponent[id].draggedElement.css({
      left: boundedLeft + 'px',
      top: boundedTop + 'px',
    });
  }
}
//===========================


//===========================
function startMove(event, rootNode, id) {
  const target = $(rootNode.current).find(event.target);
  if (!target.hasClass('draggable') || event.which === 3) {
    return;
  }

  thisComponent[id].draggedElement = target;
  const containerOffset = $(rootNode.current).find('#largerArea_'+id).offset();
  const offsetX = thisComponent[id].draggedElement.width() / 2;
  const offsetY = thisComponent[id].draggedElement.height() / 2;

  moveAt(event, rootNode, id);

  $(rootNode.current).on('mousemove', (e) => { moveAt(e, rootNode, id); });
  $(rootNode.current).on('mouseup', () => {
    $(rootNode.current).off('mousemove', (e) => { moveAt(e, rootNode, id); });
    thisComponent[id].draggedElement = null;
    $(rootNode.current).off('mouseup');
    saveWS(rootNode, id);
  });

  // Prevent the default context menu
  $(rootNode.current).find('#largerArea_'+id).on('contextmenu', function (e) {
    e.preventDefault();
  });

  // Handle right-click for the larger area element
  if (event.which === 3) {
    showContextMenu(event, thisComponent[id].draggedElement, rootNode, id);
  }
}
//===========================


//===========================
function showContextMenu(event, element, rootNode, id) {
  event.preventDefault();
  const contextMenu = $(rootNode.current).find('#contextMenu_'+id);
  var verticalScrollbarValue = document.documentElement.scrollTop || document.body.scrollTop;
  contextMenu.css({
    display: 'block',
    left: event.clientX + 'px',
    top: event.clientY + verticalScrollbarValue + 'px',
    cursor: 'pointer'
  });

  // Store a reference to the clicked element
  contextMenu.data('clickedElement', element);

  $(rootNode.current).one('click', () => {
    contextMenu.css('display', 'none');
  });

  // Remove previous click event listener and add a new one
  $(rootNode.current).find('#contextMenu_'+id+' [data-action="delete"]').off('click').on('click', (e) => { deleteElement(e, rootNode, id); });
  $(rootNode.current).find('#contextMenu_'+id+' [data-action="openSettings"]').off('click').on('click', (e) => { openSettingsForm(e, rootNode, id); });
  $(rootNode.current).find('#contextMenu_'+id+' [data-action="duplicate"]').off('click').on('click', (e) => { duplicateElement(e, rootNode, id); });
}
//===========================


//===========================
function saveWS(rootNode, id){
  wsProxy.currentWS = $(rootNode.current).find('#largerArea_'+id)[0].innerHTML;
}
//===========================


//===========================
function deleteElement(event, rootNode, id) {
  const contextMenu = $(rootNode.current).find('#contextMenu_'+id);
  const clickedElement = contextMenu.data('clickedElement');

  if (clickedElement) {
    clickedElement.remove();
  }

  contextMenu.css('display', 'none');
  saveWS(rootNode, id);
}
//===========================


//===========================
function duplicateElement(event, rootNode, id) {
  const contextMenu = $(rootNode.current).find('#contextMenu_'+id);
  const clickedElement = contextMenu.data('clickedElement');

  if (clickedElement) {
    const ceLocation = {top: parseInt(clickedElement.css('top')), left: parseInt(clickedElement.css('left'))};
    const ceSize = {width: parseInt(clickedElement.css('width')), height: parseInt(clickedElement.css('height'))};
    const dropLocation = {top: ceLocation.top + ceSize.height + 10, left: ceLocation.left + ceSize.width + 10};

    const newDuplicate = clickedElement.clone();
    const newObjectId = `object${thisComponent[id].objectIdCounter++}`;
    newDuplicate.attr('id', newObjectId);
    $(rootNode.current).find('#largerArea_'+id).append(newDuplicate);

    // Check boundaries
    const maxX = $(rootNode.current).find('#largerArea_'+id).width() - parseInt(clickedElement.css('width'));
    const maxY = $(rootNode.current).find('#largerArea_'+id).height() - parseInt(clickedElement.css('height'));
    if((dropLocation.top + ceSize.height) > maxY){ dropLocation.top = ceLocation.top - ceSize.height - 10; }
    if((dropLocation.left + ceSize.width) > maxX){ dropLocation.left = ceLocation.left - ceSize.width - 10; }

    newDuplicate.css({
      left: dropLocation.left + 'px',
      top: dropLocation.top + 'px',
    });

    newDuplicate.find('.tooltiptext').html(newObjectId);
    newDuplicate.on('contextmenu', function (e) { showContextMenu(e, newDuplicate, rootNode, id); });
  }

  contextMenu.css('display', 'none');
  saveWS(rootNode, id);
}
//===========================


//===========================
function openSettingsForm(event, rootNode, id) {
  const contextMenu = $(rootNode.current).find('#contextMenu_'+id);
  const clickedElement = contextMenu.data('clickedElement');

  if (clickedElement) {
    const objectId = clickedElement.attr('id');
    const objectColor = clickedElement.css('background-color');
    const objectWidth = clickedElement.width();
    const objectHeight = clickedElement.height();

    // Create a modal overlay
    const overlay = $('<div class="modal-overlay"></div>');
    $('body').append(overlay);

    const thisObjTemplateId = parseInt(clickedElement[0].dataset.templateId);
    const thisObjParams = thisComponent[id].allParams[thisObjTemplateId];
    let contentsStr = "<h4>CSS/HTML Parameters</h4>";

    for (const [key, value] of Object.entries(thisObjParams.elemParam)) {
      const cssKey = CamelToSnake(key);
      let cssVal = clickedElement.css(cssKey);
      let inputType = 'text';
      contentsStr += `<div class="form-row">`;
      if(key.toLowerCase().includes('color')){
        contentsStr += `<div class="color-display" style="${cssKey}: ${cssVal};"></div>`;
        inputType = 'color';
        cssVal = rgbToHex(cssVal);
      }
      if(key.toLowerCase().includes('text')){
        cssVal = clickedElement.html().substr(clickedElement.html().indexOf('</span>')+7);
      }
      contentsStr += `
        <label class="label-width" for="${cssKey}_${id}_${objectId}">${cssKey}:</label>
        <input ${(inputType == 'text' ? ' class="form-input"' : '')} type="${inputType}" id="${cssKey}_${id}_${objectId}" value="${cssVal}">
        </div>
      `;
    }

    contentsStr += "<hr><h4>Custom Parameters</h4>";

    const toop = JSON.parse(clickedElement[0].dataset["cp"]);
    for (const [key, value] of Object.entries(toop)) {
      contentsStr += `<div class="form-row">`;
      contentsStr += `
        <label class="label-width" for="${key}_${id}_${objectId}">${key}:</label>
        <input class="form-input" type="text" id="${key}_${id}_${objectId}" value="${value}">
        </div>
      `;
    }

    contentsStr += "<hr>";

    // Create the settings form
    const modal = $(`
      <div class="modal">
        <h2>${objectId}</h2>
        <hr>
        <div class="form-grid">
          ${contentsStr}
        </div>
        <div class="button-container">
          <button id="cancelSettingsButton_${id}">Cancel</button>
          <button id="submitSettingsButton_${id}">Submit</button>
        </div>
      </div>
    `);


    $('body').append(modal);

    modal.find('#cancelSettingsButton_'+id).on('click', cancelSettings);
    modal.find('#submitSettingsButton_'+id).on('click', function() { submitSettings(rootNode, objectId, id, thisObjTemplateId); });


    // Make the modal a bit bigger
    modal.width(modal.width()*1.5);

    // Center the modal on the screen
    const modalWidth = modal.width();
    const modalHeight = modal.height();
    const screenWidth = $(window).width();
    const screenHeight = $(window).height();

    const leftPosition = (screenWidth - modalWidth) / 2;
    const topPosition = (screenHeight - modalHeight) / 2;

    var verticalScrollbarValue = document.documentElement.scrollTop || document.body.scrollTop;

    modal.css({
      left: leftPosition + 'px',
      top: topPosition + verticalScrollbarValue + 'px',
    });

    // Remove the modal and overlay when clicking outside the modal or on Cancel button
    overlay.on('click', cancelSettings);
    modal.find('button:contains("Cancel")').on('click', cancelSettings);
  }

  contextMenu.css('display', 'none');
}
//===========================


//===========================
function submitSettings(rootNode, objectId, id, templateId) {
  const thisObj = $(`#${objectId}`);

  const thisObjParams = thisComponent[id].allParams[templateId];
  for (const [key, value] of Object.entries(thisObjParams.elemParam)) {
    const cssKey = CamelToSnake(key);
    const newVal = $('#'+cssKey+'_'+id+'_'+objectId).val();
    if(key.toLowerCase().includes('text')){
      thisObj.html(`<span class="tooltiptext">${objectId}</span>`+newVal);
    }
    else{
      thisObj.css(cssKey, newVal);
    }
  }

  const toop = JSON.parse(thisObj[0].dataset["cp"]);
  for (const [key, value] of Object.entries(toop)) {
    toop[key] = $('#'+String(key)+'_'+id+'_'+objectId).val();
  }
  thisObj[0].dataset["cp"] = JSON.stringify(toop);

  // Close the modal
  $('.modal, .modal-overlay').remove();
  saveWS(rootNode, id);
}
//===========================


//===========================
function cancelSettings() {
  $('.modal, .modal-overlay').remove();
}
//===========================


//===========================
const adjustSmallerAreaWidth = (rootNode, id) => {
  const hasScrollbar = $(rootNode.current).find('#smallerArea_'+id)[0].scrollHeight > $(rootNode.current).find('#smallerArea_'+id).height();

  // Add or remove a class based on scrollbar visibility
  $(rootNode.current).find('#smallerArea_'+id).toggleClass('has-scrollbar', hasScrollbar);
};
//===========================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function Cadsies({
  data,
  mappings,
  options,
  colorTags,
  originalOptions,
  id,
}) {
  // Initiation of the VizComp
  const rootNode = useRef(null);
  const uid = "id"+id;
  let internalOptions = {...defaultOptions, ...options};

  if(thisComponent[id] == undefined || thisComponent[id].currentWS == undefined){
    thisComponent[id] = {
      draggedElement: null,
      objectIdCounter: 1,
      allParams: [],
      currentWS: ""
    };
  }

  wsProxy = new Proxy(thisComponent[id], {
    set: function (target, key, value) {
        target[key] = value;
        options.ws = target[key];
        return true;
    }
  });

  if(internalOptions.ws != ""){ thisComponent[id].currentWS = internalOptions.ws; }

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    $(rootNode.current).empty();

    let cadsiesTemplates = [];
    const allParams = [];
    let elemObjectsStr = "";
    if(data && data.data){
      cadsiesTemplates = data.data;
    }
    else if(!internalOptions.enableDemoSampleData){
      options.ws = undefined;
      thisComponent[id].currentWS = "";
    }

    if(internalOptions.enableDemoSampleData){ cadsiesTemplates = sampleDemoData.data; }
    else{
      if(internalOptions.ws != undefined && internalOptions.ws != "" && internalOptions.ws.indexOf("info&quot;:&quot;sampleDemoData&quot") != -1){
        options.ws = undefined;
        thisComponent[id].currentWS = "";
      }
    }

    for(let i = 0; i < cadsiesTemplates.length; i++){
      const elemParamStr = (cadsiesTemplates[i].elemParam).replaceAll("$", ",");
      const objParamStr = (cadsiesTemplates[i].objParam).replaceAll("$", ",");
      const elemParam = JSON.parse(elemParamStr);
      const objParam = JSON.parse(objParamStr);
      allParams.push({elemParam: elemParam, objParam: objParam})
      let dataStr = JSON.stringify(objParam);
      let styleStr = "";
      let txtStr = "";
      for (const [key, value] of Object.entries(elemParam)) {
        if(key != 'text'){ styleStr += CamelToSnake(key) + ': ' + value + '; '; }
        else { txtStr += value }
      }

      elemObjectsStr += `<div id='cadsiesTemplate${i}' style='${styleStr}' class='draggable' data-template-id='${i}' data-cp='${dataStr}'>${txtStr}</div>`;
    }

    let wsMemory = "";
    if(thisComponent[id] != undefined && thisComponent[id].currentWS != undefined && thisComponent[id].currentWS != ""){
      wsMemory = thisComponent[id].currentWS;
    }

    $(rootNode.current).append(`
      <div class="cadsiesBody" style="width: ${internalOptions.extent.width}${internalOptions.extentUnit.width}; height: ${internalOptions.extent.height}${internalOptions.extentUnit.height};">
        <div id="container_${id}" style="display: flex; height: 100%;">
          <div id="smallerArea_${id}" style="border: 1px solid #ccc; overflow-y: auto; flex: 0 0 auto;">
            ${elemObjectsStr}
          </div>
          <div id="largerArea_${id}" style="border: 1px solid #ccc; flex: 1; position: relative;">${wsMemory}</div>
          <div id="contextMenu_${id}" class="context-menu">
            <div data-action="delete">Delete</div>
            <div data-action="openSettings">Open Settings</div>
            <div data-action="duplicate">Duplicate</div>
          </div>
        </div>
      </div>`
    );

    thisComponent[id].allParams = allParams;

    // Event delegation for dynamically created elements
    $(rootNode.current).find('#smallerArea_'+id).on('mousedown', (e) => { startDrag(e, rootNode, id); });
    $(rootNode.current).find('#largerArea_'+id).on('mousedown', (e) => { startMove(e, rootNode, id); } );

    $(rootNode.current).find('#largerArea_'+id).children('.draggable').each(function () {
      $(this).on('contextmenu', function (event) { showContextMenu(event, $(this), rootNode, id); });
    });

    // Call the adjustment function after loading and when the window is resized
    $(window).on('load resize', (e) => { adjustSmallerAreaWidth(rootNode, id); });
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
    <div>
      <div ref={rootNode} />
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
Cadsies.propTypes = {
  data: PropTypes.shape({}),
  options: PropTypes.shape({
    something: PropTypes.string,
    anotherThing: PropTypes.number,
    diff: PropTypes.string,
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
Cadsies.defaultProps = {
  data: {},
  options: defaultOptions,
  colorTags: [],
};
//-------------------------------------------------------------------------------------------------
