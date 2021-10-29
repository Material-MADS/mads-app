import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import HeatMap from '../VisComponents/HeatMap';
import HeatMapForm from './HeatMapForm';

import _ from 'lodash';

import convertExtentValues from './FormUtils';

class HeatMapView extends withCommandInterface(HeatMap, HeatMapForm) {

  handleSelectionChange = (indices) => {
    const { dataset, updateSelection } = this.props;
    const data = this.mapData(dataset);

    let selections = [];
    indices.forEach((i) => {
      const idx = data.indices[i];
      selections = [...selections, ...idx];
    });
    console.log(selections);
    updateSelection(selections);
  };

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
    const df = new DataFrame(dataset.main.data);
    const xData = (df.get(newValues.xData).values.toArray()).map(v => (v + ''));
    const yData = (df.get(newValues.yData).values.toArray()).map(v => (v + ''));
    const heatVal = (df.get(newValues.heatVal).values.toArray()).map(v => (parseFloat(v)));
    const data = { xData, yData, heatVal };
    // newValues["data"] = data;

    let xRange = [];
    if(isNaN(xData[0])){
      xRange = (xData.filter((v, i, a) => a.indexOf(v) === i)).sort();
    }
    else{
      xRange = (xData.filter((v, i, a) => a.indexOf(v) === i)).sort((a,b) => parseInt(a)-parseInt(b));
      if(parseInt(xRange[1]) > parseInt(xRange[xRange.length - 1])){
        xRange.reverse();
      }
    }

    let yRange = [];
    if(isNaN(yData[0])){
      yRange = (yData.filter((v, i, a) => a.indexOf(v) === i)).sort();
    }
    else{
      yRange = (yData.filter((v, i, a) => a.indexOf(v) === i)).sort((a,b) => parseInt(a)-parseInt(b));
      if(parseInt(yRange[1]) < parseInt(yRange[yRange.length - 1])){
        yRange.reverse();
      }
    }

    newValues['options']['x_range'] = xRange;
    newValues['options']['y_range'] = yRange;
    newValues['options']['toolTipTitles'] = [newValues.xData, newValues.yData, newValues.heatVal];
    newValues['options']['title'] = 'Heat map for ' + newValues.heatVal + ' for each cross section of a specific ' + newValues.xData + ' and ' + newValues.yData;

    newValues = convertExtentValues(newValues);

    // updateView(id, newValues);
    actions.sendRequestViewUpdate(view, newValues, data);
  };

  mapData = (dataset) => {
    const { id } = this.props;
    let data = {};

    if (dataset[id]) {
      const testColumn = this.props.view.settings.xData;
      if (dataset.main.schema.fields.some(e => e.name === testColumn)) {
        data = dataset[id];
      }
      else{
        data["resetRequest"] = true;
      }
    }

    return data;
  };
}

export default HeatMapView;
