import { DataFrame } from 'pandas-js';

import withCommandInterface from './ViewWrapper';
import PeriodicTableChart from '../VisComponents/PeriodicTableChart';
import PeriodicTableForm from './PeriodicTableForm';

import _ from 'lodash';

import convertExtentValues from './FormUtils';

const settings = {
  options: { title: 'Periodic Table' },
};

class PeriodicTableView extends withCommandInterface(PeriodicTableChart, PeriodicTableForm, settings) {

//   handleSelectionChange = (indices) => {
//     const { dataset, updateSelection } = this.props;
//     const data = this.mapData(dataset);

//     let selections = [];
//     indices.forEach((i) => {
//       const idx = data.indices[i];
//       selections = [...selections, ...idx];
//     });
//     console.log(selections);
//     updateSelection(selections);
//   };

  handleSubmit = (values) => {    
    const { id, view, updateView, colorTags, actions, dataset } = this.props;
    let newValues = { ...values };

    // filter out non-existing columns & colorTags
    // if (values.filter) {
    //   const colorTagIds = colorTags.map((c) => c.id);
    //   const filteredFilters = values.filter.filter((f) =>
    //     colorTagIds.includes(f)
    //   );
    //   newValues.filter = filteredFilters;
    // }

    // if (!newValues.targetColumns[0] || !newValues.bins) {
    //   return;
    // }
    
    // // extract data
    // const df = new DataFrame(dataset.main.data);
    // const s = df.get(newValues.targetColumns[0]);
    // const data = s.values.toArray();

    newValues = convertExtentValues(newValues);

    // actions.sendRequestViewUpdate(view, newValues, data);
    updateView(id, newValues);
  };

  mapData = (dataset) => {    

    // const tc = this.props.view.settings.targetColumns[0];
    // const b = this.props.view.settings.bins;
    // const dataVals = dataset.main.data.map(elem => elem[tc]);
    // dataVals.sort((a, b) => a - b);
    // const step = (dataVals[dataVals.length-1] - dataVals[0]) / b;   
    // const data =  { dimensions: _.range(b).map((i) => (i*step).toFixed(2) + " - " + (step*(i+1)).toFixed(2) ), values: Array(b).fill(0) };    
    // dataVals.forEach(item => {
    //     for(let i=0; i < b; i++){
    //         if(item > (step*i) && item < (step*(i+1))){
    //             data.values[i]++;
    //             break;
    //         }
    //     }  
    // });
    
    // return data;
    return dataset;
  };
}

// const mapStateToProps = state => ({
//   dataset: state.dataset,
//   selection: state.selection,
// });

// export default connect(mapStateToProps)(ScatterView);
export default PeriodicTableView;
