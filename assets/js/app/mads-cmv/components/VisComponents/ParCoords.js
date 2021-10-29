import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as deepEqual from 'deep-equal';
import 'parcoord-es/dist/parcoords.css';
import ParCoords from 'parcoord-es';
import { Header } from 'semantic-ui-react';

import { Series, DataFrame } from 'pandas-js';

import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';

const Category10_10 = Category10.Category10_10;

const defaultOptions = {
  title: 'Parallel Coordinates',
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 400, height: 400 },
};

const defaultStyle = {
  position: 'relative',
  width: '400px',
  height: '400px',
};

const chartRoot = {
  position: 'absolute',
  top: '20px',
  right: 0,
  bottom: 0,
  left: 0,
};

const headerStyle = {
  margin: '10px',
};

const testData = [
  [0, -0, 0, 0, 0, 1],
  [1, -1, 1, 2, 1, 1],
  [2, -2, 4, 4, 0.5, 1],
  [3, -3, 9, 6, 0.33, 1],
  [4, -4, 16, 8, 0.25, 1],
];

function ParCoordsPlot({
  data,
  axes,
  options,
  colorTags,
  selectedIndices,
  onSelectedIndicesChange,
}) {
  const rootNode = useRef(null);
  const pcRef = useRef(null);

  // const [mainFigure, setMainFigure] = useState(null);
  // const [cds, setCds] = useState(null);
  // const [views, setViews] = useState(null);
  // let cds = null;
  // let views = null;
  let selectedIndicesInternal = null;

  const color = `#${Category10_10[0].toString(16)}`;

  const createChart = () => {
    const parcoords = ParCoords()(rootNode.current).alpha(0.4);
    // parcoords.interactive();

    // views = Bokeh.Plotting.show(fig, rootNode.current);
    pcRef.current = parcoords;
  };

  const clearChart = () => {
    pcRef.current = null;
  };

  console.log('axes: ', axes);

  const updateChart = () => {
    console.log('update chart...', data);
    console.log(pcRef.current);
    const pc = pcRef.current;

    if (!data || data.length == 0) {
      console.warn('empty data');
      return;
    }

    const indexedData = data.map((d, i) => {
      d['[index]'] = i;
      return d;
    });
    console.log(indexedData);

    const df = new DataFrame(indexedData);
    // console.log(df);
    // window.df = df;
    let modData = df.to_json({ orient: 'records' });
    if (axes.length > 0) {
      modData = df.get([...axes, '[index]']).to_json({ orient: 'records' });
    }

    pc.data();

    pc.data(modData)
      .mode('queue')
      .hideAxis(['[index]'])
      .composite('darker')
      .render()
      .shadows()
      .reorderable()
      .brushMode('1D-axes');
    // .brushMode('angular'); // enable brushing;

    // pc.reorderable().brushMode('1D-axes').updateAxes();
    pc.removeAxes();
    pc.createAxes();
    pc.brushMode('1D-axes');
    pc.updateAxes();

    window.pc = pc;

    pc.on('brushend', function (brushed, args) {
      const {
        selection: {
          raw, //raw coordinate
          scaled, //y-scale transformed
        },
        node, // svg node
        axis, // dimension name
      } = args;
      console.log(brushed);
      // console.warn(args);
      const selected = new DataFrame(brushed);

      let selectedIndices = [];
      console.log(modData);
      if (brushed.length == modData.length) {
        selectedIndices = null;
      } else if (brushed.length == 0) {
        console.log('selection clear');
        selectedIndices = [];
      } else {
        selectedIndices = selected
          .get('[index]')
          .to_json({ orient: 'records' });
      }

      console.log(selectedIndices);

      if (
        onSelectedIndicesChange &&
        !deepEqual(selectedIndices, selectedIndicesInternal)
      ) {
        // this.selecting = true;
        // // console.log(indices, this.lastSelections);
        // this.lastSelections = [...indices];
        selectedIndicesInternal = selectedIndices;
        onSelectedIndicesChange(selectedIndices);
        // this.selecting = false;
      }
    });
  };

  useEffect(() => {
    console.info('mount');
    createChart();
    return () => {
      console.info('unmount');
      clearChart();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('data changed...', data);
    updateChart();
  }, [data, axes, colorTags]);

  useEffect(() => {
    console.log('colorTag changed...', data, pcRef.current);
    // colorTag
    const colors = new Array(data.length).fill(
      `#${Category10_10[0].toString(16)}`
    );
    colorTags.forEach((colorTag) => {
      colorTag.itemIndices.forEach((i) => {
        colors[i] = colorTag.color;
      });
    });
    console.log(colors);

    const lineColor = (d) => {
      console.log(d);
      const i = d['[index]'];

      return colors[i];
    };

    if (colors.length > 0) {
      pcRef.current.color(lineColor);
      pcRef.current.render();
    }
  }, [colorTags]);

  // TODO: implement behavior when selecting
  // // const prevCds = usePrevious(cds);
  // useEffect(() => {
  //   console.log('selection changed ...', selectedIndices);

  //   if (deepEqual(selectedIndices, selectedIndicesInternal)) {
  //     return;
  //   }

  //   const pc = pcRef.current;
  //   pc.unmark();
  //   if (selectedIndices === null) {
  //     pc.brushReset();
  //     return;
  //   }

  //   if (selectedIndices.length === 0) {
  //     // pc.brushReset();
  //     // pc.brushed([]);
  //     // pc.render();

  //     return;
  //   }

  //   const dd = pc.data();
  //   // pc.brushReset();
  //   // pc.brushed(dd.filter((d) => selectedIndices.includes(d['[index]'])));
  //   // pc.render();
  //   pc.mark(dd.filter((d) => selectedIndices.includes(d['[index]'])));

  //   // console.log(prevCds);
  //   // if (selectedIndices.length === 0) {
  //   //   if (prevCds) {
  //   //     prevCds.selected.indices = [];
  //   //   }
  //   // }
  // }, [selectedIndices]);

  // style settings
  const style = { ...defaultStyle };
  if (options.extent.width) {
    style.width = options.extent.width;
  }
  if (options.extent.height) {
    style.height = options.extent.height;
  }

  return (
    <div id="container" style={style}>
      <Header size="tiny" style={headerStyle}>
        Parallel Coordinates
      </Header>
      {/* <div>Parallel Coordinates</div> */}
      <div ref={rootNode} style={chartRoot} className="parcoords" />
    </div>
  );
}

ParCoordsPlot.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  axes: PropTypes.arrayOf(PropTypes.string),
  options: PropTypes.shape({
    extent: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
  }),
  colorTags: PropTypes.arrayOf(PropTypes.object),
  selectedIndices: PropTypes.arrayOf(PropTypes.number),
  onSelectedIndicesChange: PropTypes.func,
};

ParCoordsPlot.defaultProps = {
  data: [],
  axes: [],
  options: { extent: { width: 800, height: 400 } },
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};

export default ParCoordsPlot;
