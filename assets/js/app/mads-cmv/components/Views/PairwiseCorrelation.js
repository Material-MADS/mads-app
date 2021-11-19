import withCommandInterface from './ViewWrapper';
import HeatMap from '../VisComponents/HeatMap';
import PairwiseCorrelationForm from './PairwiseCorrelationForm';

import convertExtentValues from './FormUtils';

import * as jz from 'jeezy';
import * as chroma from 'chroma-js';

const settings = {
  options: { title: 'Pairwise Correlation' },
};

var fcMemory = [];

class PairwiseCorrelationView extends withCommandInterface(HeatMap, PairwiseCorrelationForm, settings) {
  handleSubmit = (values) => {
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    if (values.filter) {
      const colorTagIds = colorTags.map((c) => c.id);
      const filteredFilters = values.filter.filter((f) =>
        colorTagIds.includes(f)
      );
      newValues.filter = filteredFilters;
    }

    // extract data
    let data = { xData: [], yData: [], heatVal: [] };

    if(newValues.selectAllColumns){
      console.warn('xxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      console.warn(dataset.main.data);
      newValues.featureColumns = (Object.keys(dataset.main.data[0])).filter(col => col != 'index');
      fcMemory = newValues.featureColumns;
      console.warn(fcMemory);
      console.warn('-----------------------------');
    }

    var mask = [];
    const colsSorted = newValues.featureColumns.sort();
    const colsSortedR = newValues.featureColumns.sort().reverse();
    var isVisible = 1;
    for(var i = 0; i < colsSorted.length; i++){
      for(var k = 0; k < colsSortedR.length; k++){
        if(isVisible == 1){
          if(colsSorted[i] == colsSortedR[k]){
            isVisible = 0;
          }
        }
        mask.push([colsSorted[i]+"-"+colsSortedR[k], isVisible]);
      }
      isVisible = 1;
    }

    var corr = jz.arr.correlationMatrix(dataset.main.data, newValues.featureColumns);
    var allX = [], allY = [];
    corr.forEach(item => {
      if(newValues.options.maskEnabled){
        var corrVal = 0;
        var testStr = item.column_x +"-"+item.column_y;
        for(var i = 0; i < mask.length; i++){
          if(testStr == mask[i][0]){
            if(mask[i][1] != 0){
              corrVal = item.correlation;
            }
            break;
          }
        }
        if(corrVal != 0){
          data.xData.push(item.column_x);
          data.yData.push(item.column_y);
          data.heatVal.push(corrVal);
        }
      }
      else{
        data.xData.push(item.column_x);
        data.yData.push(item.column_y);
        data.heatVal.push(item.correlation);
      }
      allX.push(item.column_x);
      allY.push(item.column_y);
    });
    const xRange = (allX.filter((v, i, a) => a.indexOf(v) === i)).sort();
    const yRange = (allY.filter((v, i, a) => a.indexOf(v) === i)).sort().reverse();

    var c = chroma.scale(["#3B4CC0", "white", "#B40426"]).domain([-1, 0, 1]).colors(100), cMap = undefined;
    if(newValues.colorRange){ c = undefined; cMap = 'RdYlBu'; }

    const newOptions = {
      ...newValues.options,
      x_range: xRange,
      y_range: yRange,
      toolTipTitles: ['X', 'Y', 'Correlation'],
      colorMap: cMap,
      colors: c,
      colorMapperMinMax: [-1,1],
      heatValUnit: '',
      x_axis_location: 'below',
      title: `Pairwise Correlation Values for the selected columns of current Data`,
    };
    newValues.options = newOptions;

    newValues = convertExtentValues(newValues);
    actions.sendRequestViewUpdate(view, newValues, data);
  };


  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      const testColumn = this.props.view.settings.featureColumns ? this.props.view.settings.featureColumns[0] : fcMemory[0];
      if (dataset.main.schema.fields.some(e => e.name === testColumn)) {
        data = dataset[id];
      }
      else{
         data["resetRequest"] = true;
         fcMemory = [];
         this.props.view.settings.featureColumns = [];
         this.props.view.settings.selectAllColumns = false;
      }
    }

    return data;
  };
}

export default PairwiseCorrelationView;
