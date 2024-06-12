/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q6 2024
// ________________________________________________________________________________________________
// Authors: Akihiro Honda
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'NetworkAnalysis' 
//              module
// ------------------------------------------------------------------------------------------------
// Notes: 'Network Analysis' is a tool to create and visualize network diagrams based on
//         centrality. It can mark specific nodes and display the shortest paths.
// ------------------------------------------------------------------------------------------------
// References: React, redux, prop-types Libs, 3rd party lodash, jquery, and d3
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from 'react-redux'
import { Popup, Input } from 'semantic-ui-react';
import PropTypes from "prop-types";
import * as d3 from 'd3';

import './NetworkAnalysisVisStyles.css';

import _ from 'lodash';
import $ from "jquery";

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "The burse",
  extent: { width: 700, height: 700 },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function NetworkAnalysis({
  data,
  options,
  colorTags,
  id,
  selectedIndices,
}) {
  // console.log("internalData");
  // console.log(data);

  // Initiation of the VizComp
  const rootNode = useRef(null);
  let internalOptions = Object.assign({}, defaultOptions, options);
  const ngd = "graphDiv" + id;
  const internalData = {...data};


  // Variable to hold the zoom state
  const zoomTransform = useRef(d3.zoomIdentity);

  // Setting
  const [scale, setScale] = useState(1); // Initial Scale is 1x
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [highlightedInfo, setHighlightedInfo] = useState('');
  const [highlightedInfoOpen, setHighlightedInfoOpen] = useState(false);
  const [markingNode, setMarkingNode] = useState('') 

  // Scaling function
  const handleZoom = (event) => {
    setScale(event.transform.k); 
    d3.select(rootNode.current).select('g').attr('transform', event.transform); 
    zoomTransform.current = event.transform; 
  };

  let currentDataSourceName = "";
  try {
    const availableDataSources = useSelector((state) => state.dataSources);
    currentDataSourceName = (availableDataSources.items.find(item => availableDataSources.selectedDataSource == item.id)).name;
  } catch (error) { /*Just ignore and move on*/ }

  // -----------------------------------------------------------------------------------------
  
  // -----------------------------------------------------------------------------

  // Create the VizComp based on the incoming parameters
  const createChart = async () => {
    $(rootNode.current).empty();
    setHighlightedInfoOpen((prev) => false);

    // --- D3 GRAPH JS -------------------

    // console.log("internalData");
    // console.log(internalData);

    if(internalData.linkList){

      // Generate links
      const links = internalData.linkList.map(link => ({
        source: link.sn,
        target: link.tn,
        value: link.lw
      }));
      // console.log(links)
      
      // Generate Nodes
      let nodes = {}
      // Leave a single Node
      if(internalData.remainLonelyNodes == true){
        nodes = links.flatMap(link => [link.source, link.target]).map(id => ({ id,
          centrality: internalData.cerl[id] || 0 ,// Get Centrality value, Default is 0
          cluster: internalData.clusters[id] || 0 // Cluster Information
         }));
      };
      // Exclude a single node
      if(internalData.remainLonelyNodes == false){
        const linkedNodes = new Set();
        links.forEach(link => {
          linkedNodes.add(link.source);
          linkedNodes.add(link.target);
        });
        nodes = Array.from(linkedNodes).map(id => ({ id,
          centrality: internalData.cerl[id] || 0 ,// Get Centrality value, Default is 0
          cluster: internalData.clusters[id] || 0 // Cluster Information
         }));
      };
    
      // // Default Data For Test
      //   const nodes = [
      //     { id: 'A', size: 10, color: 'red' },
      //     { id: 'B', size: 20, color: 'green' },
      //     { id: 'C', size: 15, color: 'blue' },
      //   ];
      //   const links = [
      //     { source: 'A', target: 'B', value: 1 },
      //     { source: 'B', target: 'C', value: 2 },
      //     { source: 'A', target: 'C', value: 3 },
      //   ];

      // Scale function to scale Node size based on Centrality
      const sizeScale = d3.scaleLinear()
      .domain(d3.extent(nodes, d => d.centrality))
      .range([5, 20]); // Minimum size 5, Maximum size 20

      let colorScale = d3.scaleLinear()
        .domain(d3.extent(nodes, d => d.centrality))
        .range(['blue', 'red']); // Minimum value is blue, maximum value is red

      if (internalData.clustering == true){
        colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Reconfigure colors by cluster
      }

      const svg = d3.select(rootNode.current);
      const width = svg.attr('width');
      const height = svg.attr('height');

      svg.selectAll('*').remove(); // Clear existing SVG elements

      // Set Cluster Center
      const clusterCenters = {};
      nodes.forEach(node => {
        if (!clusterCenters[node.cluster]) {
          clusterCenters[node.cluster] = { x: Math.random() * width, y: Math.random() * height };
        }
      });
  
      // Force Simulation Settings
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(1))
        .force('charge', d3.forceManyBody().strength(-40))
        .force('center', d3.forceCenter(width / 2, height / 2))
      if (internalData.clustering == true){
        simulation
        .force('x', d3.forceX().strength(0.1))
        .force('y', d3.forceY().strength(0.1))
        .force('cluster', clusterForce(0.0025)); // Cluster Attractive Power
      }

      // Add root g element
      const g = svg.append('g');
      
      // Scaling function added
      const zoom = d3.zoom()
        .scaleExtent([0.1, 10]) // 最小0.1倍、最大10倍まで拡大縮小可能に設定
        .on('zoom', handleZoom);

      svg.call(zoom);


      // Create Tooltips
      var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', '#fff')
        .style('border', '5px solid #00a1e9')
        .style('padding', '10px')
        .style('border-radius', '12px')
        .style('box-shadow', '0px 0px 5px rgba(0,0,0,0.2)');
      
      function handleMouseOver(event, node) {
        // Get number of Links and Link Destinations
        const linkedEdges = links.filter(link => link.source.id === node.id || link.target.id === node.id);
        const linkCount = linkedEdges.length;
        const linkTargets = linkedEdges.map(link => (link.source.id === node.id ? link.target.id : link.source.id)).join(',  ');
        // console.log(links)
        // console.log(linkedEdges)

        // Set Tooltip contents
        tooltip.html(`
          <font size="3"><b>《 ${node.id}》</b></font><br>
          <strong>Link count</strong> ${linkCount}<br>
          <strong>Link to:</strong> ${linkTargets}
        `);
        
        // Display Tooltip
        tooltip.style('visibility', 'visible');
        // console.log('calling')
      }

      // Move Tooltip to mouse position
      function handleMouseMove (event) {
        tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
      };

      function handleMouseOut() {
        // Hide Tooltip
        tooltip.style('visibility', 'hidden');
        // console.log('call out')
      }


      // Drawing Links
      const link = g.append('g')
        .attr('stroke', '#999')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-width', d => Math.sqrt(d.value));
  
      // Drawing Nodes
      const node = g.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', (internalData.centralityType == '') ? 8 :
            d => sizeScale(d.centrality)) // Sizes Nodes based on Centrality
        .attr('fill', d => (internalData.clustering == true) ? colorScale(d.cluster)
         : colorScale(d.centrality)) // Set colors based on Centrality or Clusters
        .call(drag(simulation))
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut)
        .on('click', handleNodeClick);
  

      // Node drag settings
      function drag(simulation) {
        function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }
  
        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }
  
        function dragended(event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
          // This is for when you want to hold a node in place after dragging
          // event.subject.fx = event.x;
          // event.subject.fy = event.y;
          // simulation.alpha(0.6).restart();
        }
  
        return d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended);
      }
  
      // Force simulation tick event
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
  
        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });


      // Marking if there is an input
      if (internalData.markNode) {
        node.attr('fill', d => {
          if (internalData.markNode == d.id) {return 'lime'}
          else if (internalData.clustering == true) {return colorScale(d.cluster)}
          return colorScale(d.centrality);
        })
      };

      // Shortest Path function
      function handleNodeClick(event, d) {
        if (!event.ctrlKey) return;

        setSelectedNodes((prev) => {
          const newSelectedNodes = [...prev, d];
          if (newSelectedNodes.length === 2) {
            highlightShortestPath(newSelectedNodes[0], newSelectedNodes[1]);
            return [];
          }
          else if(newSelectedNodes.length === 1) {
            highlightSelectedNode(newSelectedNodes[0])
            return newSelectedNodes;
          }
          return newSelectedNodes;
        });
      }

      // Colorize the clicked node
      function highlightSelectedNode(selectedNode) {
        node.attr('fill', d => {
          if (selectedNode.id == d.id) {return 'yellow'}
          else if (internalData.markNode == d.id) {return 'lime'}
          else if (internalData.clustering == true) {return colorScale(d.cluster)}
          return colorScale(d.centrality);
        })
        node.attr('stroke', d => {return (selectedNode.id == d.id) ? '#000':'#fff' });
        link.attr('stroke', d => {'#999'});
      }

      // Visualize the Shortest Path
      function highlightShortestPath(sourceNode, targetNode) {
        const graph = {};
        nodes.forEach(node => {
          graph[node.id] = {};
        });
        links.forEach(link => {
          graph[link.source.id][link.target.id] = link.value;
          graph[link.target.id][link.source.id] = link.value;
        });

        const shortestPath = dijkstra(graph, sourceNode.id, targetNode.id);

        link.attr('stroke', d => {
          return shortestPath.includes(d.source.id) && shortestPath.includes(d.target.id) ? 'red' : '#999';
        })
        .attr('stroke-width', d => {
          return shortestPath.includes(d.source.id) && shortestPath.includes(d.target.id) ? '2' : Math.sqrt(d.value)
        });
        node.attr('fill', d => {
          if (shortestPath.includes(d.id)) {return 'yellow'}
          else if (internalData.markNode == d.id) {return 'lime'}
          else if (internalData.clustering == true) {return colorScale(d.cluster)}
          return colorScale(d.centrality);
        })
        node.attr('stroke', d => {return shortestPath.includes(d.id) ? '#000':'#fff' });

        const pathContents= shortestPath.join(' ⇒ ');
        setHighlightedInfo(`
          <string><b>${pathContents}</b></string>
       `);
        setHighlightedInfoOpen((prev) => true);
      };

      // Dijkstra's algorithm
      function dijkstra(graph, start, end) {
        const distances = {};
        const prev = {};
        const queue = [];

        for (let vertex in graph) {
          distances[vertex] = Infinity;
          prev[vertex] = null;
          queue.push(vertex);
        }
        distances[start] = 0;

        while (queue.length > 0) {
          queue.sort((a, b) => distances[a] - distances[b]);
          const u = queue.shift();

          if (u === end) {
            const path = [];
            let temp = u;
            while (prev[temp]) {
              path.unshift(temp);
              temp = prev[temp];
            }
            path.unshift(start);
            return path;
          }

          for (let neighbor in graph[u]) {
            const alt = distances[u] + graph[u][neighbor];
            if (alt < distances[neighbor]) {
              distances[neighbor] = alt;
              prev[neighbor] = u;
            }
          }
        }
        return [];
      }

      // Cluster Attractive Power
      function clusterForce(strength) {
        return () => {
          nodes.forEach(node => {
            const clusterCenter = clusterCenters[node.cluster];
            node.vx -= (node.x - clusterCenter.x) * strength;
            node.vy -= (node.y - clusterCenter.y) * strength;
          });
        };
      }
  
      return () => {
        simulation.stop();
        tooltip.remove(); // Remove tooltip when component is unmounted
      };

    }else{
      console.log("No data found");
      
      // ====================================================================================================-
      
      // const enodes = [
      //   { id: 'A', size: 10, color: 'red' },
      //   { id: 'B', size: 20, color: 'green' },
      //   { id: 'C', size: 15, color: 'blue' },
      // ];
      // const elinks = [
      //   { source: 'A', target: 'B', value: 1 },
      //   { source: 'B', target: 'C', value: 2 },
      //   { source: 'A', target: 'C', value: 3 },
      // ];
      // const svg = d3.select(rootNode.current);
      // const width = svg.attr('width');
      // const height = svg.attr('height');
      // const g = svg.append('g');
      // svg.selectAll('*').remove();
      // // フォースシミュレーションの設定
      // const simulation = d3.forceSimulation(nodes)
      //   .force('link', d3.forceLink(links).id(d => d.id).distance(1))
      //   .force('charge', d3.forceManyBody().strength(-40))
      //   .force('center', d3.forceCenter(width / 2, height / 2))
      // // リンクの描画
      // const elink = g.append('g')
      //   .attr('stroke', '#999')
      //   .selectAll('line')
      //   .data(elinks)
      //   .enter().append('line')
      //   .attr('stroke-width', d => Math.sqrt(d.value));
      // // ノードの描画
      // const enode = g.append('g')
      //   .attr('stroke', '#fff')
      //   .attr('stroke-width', 1.5)
      //   .selectAll('circle')
      //   .data(enodes)
      //   .enter().append('circle')
      // simulation.on('tick', () => {
      //   link
      //     .attr('x1', d => d.source.x)
      //     .attr('y1', d => d.source.y)
      //     .attr('x2', d => d.target.x)
      //     .attr('y2', d => d.target.y);
  
      //   node
      //     .attr('cx', d => d.x)
      //     .attr('cy', d => d.y);
      // });
      // return () => {
      //   simulation.stop();
      // };
      
      // ============================================================================================================

    }
    // -------------------------------------
  };
  // // Use it when you need it.
  // const handleMarkingNode = (e) => {
  //   console.log(e.target.value)
  //   setMarkingNode((prev) => e.target.value)
  // }

  const PopupNodeInfo = () => (
    <Popup id={'infoPopup'} context={rootNode} position={"top left"} wide={true} offset={highlightedInfoOffset} 
      open={highlightedInfoOpen} style={{zIndex: '900'}}>
      <div dangerouslySetInnerHTML={{__html: highlightedInfo}} />             
    </Popup>
  ) 

  const highlightedInfoOffset = ({ placement, popper }) => {
    // return [popper.width-10, popper.height-85];
    return [400, -25];
  }

  // Clear away the VizComp
  const clearChart = () => { /* Called when component is deleted */ };

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
      <PopupNodeInfo />
      {/* <input onChange={(e) => handleMarkingNode(e)}/> */}
      <svg ref={rootNode} width={internalOptions.extent.width} height={internalOptions.extent.height}/>
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
NetworkAnalysis.propTypes = {
  data: PropTypes.shape({ }),
  options: PropTypes.shape({
    title: PropTypes.string,
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number.isRequired,
    }),
  }),
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
NetworkAnalysis.defaultProps = {
  data: {},
  options: defaultOptions,
};
//-------------------------------------------------------------------------------------------------
