/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is a set of Utility Support Functions for the Visual Components
// ------------------------------------------------------------------------------------------------
// Notes: 'VisCompUtils' is a set of utility support methods provided for the VisComps when needed.
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Get Standarized Color
// Returns a Canvas compatible color from a color string
//-------------------------------------------------------------------------------------------------
export function getStandarizedColor(str){
	var ctx = document.createElement("canvas").getContext("2d");
	ctx.fillStyle = str;
	return ctx.fillStyle;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Get RGBA Color String From Any Color
// Returns a RGBA color based on any color input
//-------------------------------------------------------------------------------------------------
export function getRGBAColorStrFromAnyColor(str, opacity){
	var hex = getStandarizedColor(str);
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + (opacity || 1) + ")";
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Create UUID
// Returns a Universal Unique ID value
//-------------------------------------------------------------------------------------------------
export function create_UUID(){
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Fill Object With Missing Keys
// Take an object 1 and make sure object 2 has the same keys (Works only on shallow level)
//-------------------------------------------------------------------------------------------------
export function fillObjectWithMissingKeys(from, to) {
  for (var key in from) {
      if (from.hasOwnProperty(key)) {
          if (Object.prototype.toString.call(from[key]) === '[object Object]') {
              if (!to.hasOwnProperty(key)) {
                  to[key] = {};
              }
              fillObject(from[key], to[key]);
          }
          else if (!to.hasOwnProperty(key)) {
              to[key] = from[key];
          }
      }
  }
}
//-------------------------------------------------------------------------------------------------
