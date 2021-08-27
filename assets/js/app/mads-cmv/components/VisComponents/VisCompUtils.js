export function getStandarizedColor(str){
	var ctx = document.createElement("canvas").getContext("2d");
	ctx.fillStyle = str;
	return ctx.fillStyle;
}

export function getRGBAColorStrFromAnyColor(str){
	var hex = getStandarizedColor(str);
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ",1)";
}

export function create_UUID(){
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

//export const something = {}
