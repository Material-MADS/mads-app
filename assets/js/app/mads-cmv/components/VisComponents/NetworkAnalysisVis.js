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
import { Popup, Modal, Button, Input } from 'semantic-ui-react';
import PropTypes from "prop-types";

import * as d3 from 'd3';
import numeric from 'numeric';
// import { create, all } from 'mathjs';

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
  console.log("internalData");
  console.log(data);

  // Initiation of the VizComp
  const rootNode = useRef(null);
  const rootNodes = useRef(null);
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

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const gradients = {
    RtB: ['blue', 'red'],
    BtO: ['orange', 'black'],
    YtG: ['green', 'yellow'],
    PtP: ['pink', 'purple'],
    BtG: ['grey', "black"],
    alG: ['gray', 'gray']
    // others
  };
  
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
    // $(rootNodes.current).empty();


    setHighlightedInfoOpen((prev) => false);
    
    // --- D3 GRAPH JS -------------------

    // console.log("internalData");
    // console.log(internalData);

    // Petri Net Setting
    if(internalData.linkList){
      console.log("internalData.linkList")
      console.log(internalData.linkList)

      if (internalData.isPetriNet) {
        const additionalLinks = [];
      
        internalData.linkList.forEach(link => {
          const sources = link.sn.split('+');
          const target = link.tn;
      
          sources.forEach(source => {
            const newLink = {
              sn: source,  
              tn: link.sn, 
              lw: 1,  
            };
            additionalLinks.push(newLink);  
          });
        });

        internalData.linkList = [...internalData.linkList, ...additionalLinks];
      }

      // Generate links
      let links = internalData.linkList.map(link => ({
        source: link.sn,
        target: link.tn,
        value: link.lw
      }));

      // if(internalData.graphLayout == "Spectral Layout"){
      //   links = internalData.graphData.links.map(link => ({
      //     source: link.sn,
      //     target: link.tn,
      //     value: link.lw
      //   }));
      // }
      
      // Generate Nodes
      let nodes = {}

      // Leave a single Node
      if(internalData.remainLonelyNodes == true){
        nodes = links.flatMap(link => [link.source, link.target]).map(id => ({ id,
          centrality: internalData.cerl[id] || 0 ,// Get Centrality value, Default is 0
          cluster: internalData.clusters[id] || 0 , // Cluster Information
          parentId: internalData.parentIdMap ? internalData.parentIdMap[id] : null
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
          // parentId: parentId,
          centrality: internalData.cerl[id] || 0 ,// Get Centrality value, Default is 0
          cluster: internalData.clusters[id] || 0 , // Cluster Information
          parentId: internalData.parentIdMap ? internalData.parentIdMap[id] : null
         }));

        // if(internalData.graphLayout == "Spectral Layout"){
        //   internalData.graphData.nodes = Array.from(linkedNodes).map(id => ({ id,
        //     x:internalData.graphData.nodes.vx,
        //     y:internalData.graphData.nodes.vy,
        //     centrality: internalData.cerl[id] || 0 ,// Get Centrality value, Default is 0
        //     cluster: internalData.clusters[id] || 0 // Cluster Information
        //    }));
        // }
        if(internalData.deleteIsolatedNetworks == true){
          // Find the largest connected network
          const largestComponent = findLargestComponent(nodes, links);
          nodes = nodes.filter(node => largestComponent.has(node.id));
          links = links.filter(link => largestComponent.has(link.source) && largestComponent.has(link.target));
        }

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

      // get color by Gradient
      let colorRange = gradients['RtB'];
      if (internalData.nodeGradient in gradients) {
          colorRange = gradients[internalData.nodeGradient];
      }

      let colorScale = d3.scaleLinear()
        .domain(d3.extent(nodes, d => d.centrality))
        .range(colorRange);
      if (internalData.clustering == true){
        colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Reconfigure colors by cluster
      }

      let weightColorRange = gradients['BtG'];
      if (internalData.linkGradient in gradients) {
        weightColorRange = gradients[internalData.linkGradient];
      }
      const weightColorScale = d3.scaleLinear()
        .domain(d3.extent(links, d => d.value))
        .range(weightColorRange);

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

      // Add root g element
      const g = svg.append('g');
      
      // Scaling function added
      const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on('zoom', handleZoom);

      svg.call(zoom);

      
      // Force Simulation Settings
      let simulation = d3.forceSimulation((internalData.graphLayout == "Spectral Layout")
          ? internalData.graphData.nodes : nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(1)
          // .strength(d => d.value * 0.07)
        )
        .force('charge', d3.forceManyBody().strength(-40))
        .force('center', d3.forceCenter(width / 2, height / 2))
      if (!internalData.nodeAttraction){internalData.nodeAttraction = 0.1}
      // if (internalData.isPetriNet){
      simulation.force('link', d3.forceLink(links).id(d => d.id).distance(1).strength(d => d.value * (internalData.nodeAttraction)))
      // }
      if (!internalData.clusteringForce){internalData.clusteringForce = 0.25}
      if (internalData.clustering == true){
        const nodeCount = nodes.length; 
        const clusterStrength = 0.008 * (nodeCount / 300); 
        // simulation
        //   .force('x', d3.forceX().strength(0.1 / Math.sqrt(nodeCount)))
        //   .force('y', d3.forceY().strength(0.1 / Math.sqrt(nodeCount)))
        //   .force('cluster', clusterForce(clusterStrength)); 
        // simulation
        // .force('x', d3.forceX().strength(0.1))
        // .force('y', d3.forceY().strength(0.1))
        // .force('cluster', clusterForce(0.008)); // Cluster Attractive Power
        // old version setting
        simulation
        .force('x', d3.forceX().strength(0.1))
        .force('y', d3.forceY().strength(0.1))
        // .force('cluster', clusterForce(0.0025))
        .force('cluster', clusterForce(internalData.clusteringForce/100))
      }


      
      const defs = svg.append('defs');
      const graphIndex = Date.now();;

      // Drawing Links
      const scale = d3.scalePow().exponent(1.4).domain([0,100]).range([0.7,100]);
      let link = g.append('g')
        .attr('class', `graph-${graphIndex}`) 
        // .attr('stroke', '#999')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-width', d => scale(d.value))
        // .attr('stroke-width', d => Math.sqrt(d.value))
        .attr('stroke', d => weightColorScale(d.value))
      if(internalData.makeUndirected == false){
        link.attr('stroke', (d, i) => {
          const color = weightColorScale(d.value);
          defs.append('marker')
            .attr('id', `arrowhead-${graphIndex}-${i}`) 
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 13)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', color)
            .style('stroke', 'none');
          return color;
        })
        .attr('marker-end', (d, i) => `url(#arrowhead-${graphIndex}-${i})`); 
      }
  
      // Drawing Nodes
      let node = g.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data((internalData.graphLayout == "Spectral Layout") ? internalData.graphData.nodes : nodes)
        .enter().append('circle')
        .attr('r', d => (internalData.centralityType == '') ? 8 :
            d => sizeScale(d.centrality)) // Sizes Nodes based on Centrality
        .attr('r', d => {
          if (internalData.isPetriNet && d.id.includes('+')) {
            return sizeScale(d.centrality) * 0.6 
          }
          else if (internalData.centralityType == ''){return 8}
          return sizeScale(d.centrality)})
        .attr('fill', d => {
          if (internalData.isPetriNet && d.id.includes('+')) {
            return 'black'; 
          }
          return (internalData.clustering == true) ? colorScale(d.cluster)
            : colorScale(d.centrality); // Set colors based on Centrality or Clusters
        })
        .call(drag(simulation))
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut)
        .on('click', handleNodeClick);
      
      // Add background rect to handle deselection
      svg.insert('rect', ':first-child')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('click', resetOpacity);
 
      
      // ------------------Force-Directed Layouts---------------------------
      if(internalData.graphLayout == "Force-Directed Layouts" ){
        node.call(drag(simulation))

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

        const nodeCount = nodes.length;
        const optimalStrength = -40 * Math.log(nodeCount) / Math.log(10) ; //sekiryoku 
        const optimalLinkDistance = Math.sqrt(nodeCount) * 20 * 0.1 ;

        // simulation
        //   .force('link', d3.forceLink(links).id(d => d.id).distance(optimalLinkDistance))
        //   .force('charge', d3.forceManyBody().strength(optimalStrength))
        //   .force('center', d3.forceCenter(width / 2, height / 2))
        //   .force('x', d3.forceX(width / 2).strength(0.1 / Math.sqrt(nodeCount)))
        //   .force('y', d3.forceY(height / 2).strength(0.1 / Math.sqrt(nodeCount)));
      }

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
      // -------------------------------------------------------------------

      // ------------------Circular Layout----------------------------------
      const radius = Math.min(width, height) / 2;
      const angleStep = (2 * Math.PI) / nodes.length;

      if(internalData.graphLayout == "Circular Layout"){
        nodes.forEach((node, i) => {
          node.x = width / 2 + radius * Math.cos(i * angleStep);
          node.y = height / 2 + radius * Math.sin(i * angleStep);
        });

        node.attr('cx', d => d.x)
            .attr('cy', d => d.y);

        link.attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
      };
      // -------------------------------------------------------------------
      

      // ------------------Spectral Layout(Draft)---------------------------
      // console.log(internalData)
      // if(internalData.graphLayout == "Spectral Layout"){
      //   simulation = d3.forceSimulation(internalData.graphData.nodes)
      //     .force('link', d3.forceLink(internalData.graphData.links).id(d => d.id).distance(50))
      //   node.data(internalData.graphData.nodes)
        
      // }
      //   simulation = d3.forceSimulation(internalData.graphData.nodes)
      //     .force('link', d3.forceLink(links).id(d => d.id).distance(1))
      //     .force('charge', d3.forceManyBody().strength(-40))
      //     .force('center', d3.forceCenter(width / 2, height / 2))
      //   if (internalData.clustering == true){
      //     simulation
      //     .force('x', d3.forceX().strength(0.1))
      //     .force('y', d3.forceY().strength(0.1))
      //     .force('cluster', clusterForce(0.0025)); // Cluster Attractive Power
      //   }


      // Calculate positions using Spectral Layout
      // const laplacianMatrix = createLaplacianMatrix(nodes, links);
      // const eigenVectors = blockEigenDecomposition(laplacianMatrix, {maxiter:1000}).E;
      // const positions = eigenVectors.map(vec => [vec[1], vec[2]]);
      // const xScale = d3.scaleLinear()
      //   .domain(d3.extent(positions, pos => pos[0]))
      //   .range([0, width]);
      // const yScale = d3.scaleLinear()
      //   .domain(d3.extent(positions, pos => pos[1]))
      //   .range([0, height]);

      // if(internalData.graphLayout == "Spectral Layout"){
      //   nodes.forEach((node, i) => {
      //     node.x = xScale(positions[i][0]);
      //     node.y = yScale(positions[i][1]);
      //   });

      //   node.attr('cx', d => d.x)
      //       .attr('cy', d => d.y);

      //   link.attr('x1', d => d.source.x)
      //       .attr('y1', d => d.source.y)
      //       .attr('x2', d => d.target.x)
      //       .attr('y2', d => d.target.y);
      // }
      // -------------------------------------------------------------------

      // ------------------Hierarchical Layout(Draft)-----------------------
      if (internalData.graphLayout === "Hierarchical Layout") {
        const tree = d3.tree().size([width, height - 200]);
        const stratify = d3.stratify().id(d => d.id).parentId(d => d.parentId);

        const rootNodes = nodes.filter(node => !node.parentId);
        const pseudoRoot = { id: 'pseudo-root', parentId: null };
        nodes.forEach(node => {
          if (!node.parentId) {
            node.parentId = 'pseudo-root';
          }
        });
        nodes.push(pseudoRoot);

        const root = stratify(nodes);
        tree(root);

        link = g.selectAll('.link')
          .data(root.links().filter(d => d.source.id !== 'pseudo-root'))
          .enter().append('line')
          .attr('class', 'link')
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
          .attr('stroke', '#999')
          .attr('stroke-width', 1.5);

        node = g.selectAll('.node')
          .data(root.descendants().filter(d => d.id !== 'pseudo-root'))
          .enter().append('circle')
          .attr('class', 'node')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', 8)
          .attr('fill', 'blue')
          .on('mouseover', handleMouseOver)
          .on('mousemove', handleMouseMove)
          .on('mouseout', handleMouseOut)
          .on('click', handleNodeClick);
      }
      // -------------------------------------------------------------------


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
        event.stopPropagation(); // Prevent event from reaching the background rect
        if (!event.ctrlKey) {
          node.attr('opacity', 0.1);
          link.attr('opacity', 0.1);

          const connectedNodes = new Set();
          connectedNodes.add(d.id);

          links.forEach(link => {
            if (link.source.id === d.id) {
              connectedNodes.add(link.target.id);
            } else if (link.target.id === d.id) {
              connectedNodes.add(link.source.id);
            }
          });

          node.attr('opacity', d => connectedNodes.has(d.id) ? 1 : 0.1);
          link.attr('opacity', d => connectedNodes.has(d.source.id) && connectedNodes.has(d.target.id) ? 1 : 0.1);
        } 
        else {
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
      }


      function resetOpacity() {
        node.attr('opacity', 1);
        link.attr('opacity', 1);

        node.attr('fill', d => {
          if (internalData.markNode == d.id) {return 'lime'}
          else if (internalData.isPetriNet && d.id.includes('+')) {return 'black';}
          else if (internalData.clustering == true) {return colorScale(d.cluster)}
          return colorScale(d.centrality);
        })
        node.attr('stroke', d => {return '#fff' });

        link.each(function(d, i) {
          const color = weightColorScale(d.value);
          
          // marker setting
          d3.select(this)
            .attr('stroke', color)
            .attr('marker-end', `url(#arrowhead-${graphIndex}-${i})`);
      
          const markerId = `arrowhead-${graphIndex}-${i}`;
          d3.select(`#${markerId} path`).attr('fill', color);
        });

        setHighlightedInfoOpen((prev) => false);
      }

      // Colorize the clicked node
      function highlightSelectedNode(selectedNode) {
        node.attr('fill', d => {
          if (selectedNode.id == d.id) {return 'yellow'}
          else if (internalData.markNode == d.id) {return 'lime'}
          else if (internalData.isPetriNet && d.id.includes('+')) {return 'black';}
          else if (internalData.clustering == true) {return colorScale(d.cluster)}
          return colorScale(d.centrality);
        })
        node.attr('stroke', d => {return (selectedNode.id == d.id) ? '#000':'#fff' });

        link.each(function(d, i) {
          const color = weightColorScale(d.value);
          
          // markar setting
          d3.select(this)
            .attr('stroke', color)
            .attr('marker-end', `url(#arrowhead-${graphIndex}-${i})`);
      
          const markerId = `arrowhead-${graphIndex}-${i}`;
          d3.select(`#${markerId} path`).attr('fill', color);
        });
        // link.attr('marker-end', d => `url(#arrowhead-${graphIndex}-${d.index})`);
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

        link.each(function(d, i) {
          const isOnPath = shortestPath.includes(d.source.id) && shortestPath.includes(d.target.id);
          const color = isOnPath ? 'red' : weightColorScale(d.value);
          
          d3.select(this)
            .attr('stroke', color)
            .attr('marker-end', `url(#arrowhead-${graphIndex}-${i})`);
      
          const markerId = `arrowhead-${graphIndex}-${i}`;
          d3.select(`#${markerId} path`).attr('fill', color);
        });
        // link.attr('marker-end', d => `url(#arrowhead-${graphIndex}-${d.index})`);
        
        // .attr('stroke-width', d => {
        //   return shortestPath.includes(d.source.id) && shortestPath.includes(d.target.id) ? '2' : Math.sqrt(d.value)
        // });
        node.attr('fill', d => {
          if (shortestPath.includes(d.id)) {return 'yellow'}
          else if (internalData.markNode == d.id) {return 'lime'}
          else if (internalData.isPetriNet && d.id.includes('+')) {return 'black';}
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
            const invertedWeight = 1 / graph[u][neighbor];
            const alt = distances[u] + invertedWeight;
            // const alt = distances[u] + graph[u][neighbor];
            if (alt < distances[neighbor]) {
              distances[neighbor] = alt;
              prev[neighbor] = u;
            }
          }
        }
        return [];
      }

      // For Spectral Layout----------------------------------------------------
      function createLaplacianMatrix(nodes, links) {
        const size = nodes.length;
        const matrix = Array.from({ length: size }, () => Array(size).fill(0));

        links.forEach(link => {
          const sourceIndex = nodes.findIndex(n => n.id === link.source.id);
          const targetIndex = nodes.findIndex(n => n.id === link.target.id);
          matrix[sourceIndex][targetIndex] = -1;
          matrix[targetIndex][sourceIndex] = -1;
          matrix[sourceIndex][sourceIndex]++;
          matrix[targetIndex][targetIndex]++;
        });

        return matrix;
      }
      function blockEigenDecomposition(matrix) {
        const blockSize = Math.floor(matrix.length / 2);
        const A = matrix.slice(0, blockSize).map(row => row.slice(0, blockSize));
        const B = matrix.slice(0, blockSize).map(row => row.slice(blockSize));
        const C = matrix.slice(blockSize).map(row => row.slice(0, blockSize));
        const D = matrix.slice(blockSize).map(row => row.slice(blockSize));

        const eigenVectorsA = numeric.eig(A).E;
        const eigenVectorsD = numeric.eig(D).E;

        const eigenVectors = numeric.clone(matrix);
        eigenVectors.forEach((row, i) => {
          row.forEach((_, j) => {
            if (i < blockSize && j < blockSize) eigenVectors[i][j] = eigenVectorsA[i][j];
            else if (i >= blockSize && j >= blockSize) eigenVectors[i][j] = eigenVectorsD[i - blockSize][j - blockSize];
          });
        });

        return eigenVectors;
      }
      // -------------------------------------------------------------------------

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

      // ---------------exclude isolated nodes--------------------
      function getAdjacencyList(nodes, links) {
        const adjacencyList = new Map();
        nodes.forEach(node => adjacencyList.set(node.id, []));
        links.forEach(link => {
          adjacencyList.get(link.source).push(link.target);
          adjacencyList.get(link.target).push(link.source);
        });
        return adjacencyList;
      }
      
      function dfs(node, adjacencyList, visited) {
        const stack = [node];
        const component = [];
        while (stack.length > 0) {
          const currentNode = stack.pop();
          if (!visited.has(currentNode)) {
            visited.add(currentNode);
            component.push(currentNode);
            const neighbors = adjacencyList.get(currentNode);
            neighbors.forEach(neighbor => {
              if (!visited.has(neighbor)) {
                stack.push(neighbor);
              }
            });
          }
        }
        return component;
      }
      
      function findLargestComponent(nodes, links) {
        const adjacencyList = getAdjacencyList(nodes, links);
        const visited = new Set();
        let largestComponent = [];
      
        nodes.forEach(node => {
          if (!visited.has(node.id)) {
            const component = dfs(node.id, adjacencyList, visited);
            if (component.length > largestComponent.length) {
              largestComponent = component;
            }
          }
        });
      
        return new Set(largestComponent);
      }
      // ---------------------------------------------------------
  
      return () => {
        simulation.stop();
        tooltip.remove(); // Remove tooltip when component is unmounted
      };

    }
    
    else{
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

  const message = (
    <>
      <b>  Network Density</b>        : {internalData.density}<br />
      <b>  Average Path Length</b>    : {internalData.aplength}<br />
      <b>  Network Diameter</b>       : {internalData.diameter}<br />
      <b>  Clustering Coefficient</b> : {internalData.globalcluscoe}
    </>
  );

  const [isDisabled, setIsDisabled] = useState(true);
  useEffect(() => {
    if (internalData && internalData.centralityType) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [internalData]);
  const handleExport = () => {
    if (!internalData || !internalData.centralityType) return;
    const keys = Object.keys(internalData.cerl);
    const values = Object.values(internalData.cerl);
    const csv = keys.map((key, index) => `${key},${values[index]}`).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    link.setAttribute("target", "_blank");
    link.setAttribute('download', "centrality.csv");
    link.click();
    try {
      document.body.removeChild(link);
    } catch (error) {}
  };
  

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

  console.log(internalOptions.extent.width)
  // Add the VizComp to the DOM
  return (
    <div>
      <div style={{ top: 0, left: 0, width: '100%', zIndex: 10 , background: 'white', padding: '3px 0', }}>
        <Modal
          trigger={<Button>Statistic</Button>}
          header="Statistical Analysis"
          content={<pre>{message}</pre>}
          actions={[{ key: 'done', content: 'OK', positive: true }]}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
          }}
        />
        <Button onClick={() => {handleExport();}} disabled={isDisabled} style={{ marginRight: '5px' }}>Export Centrality</Button>
      </div>
      <PopupNodeInfo />
      {/* <input onChange={(e) => handleMarkingNode(e)}/> */}
      <svg ref={rootNode} width={internalOptions.extent.width} height={internalOptions.extent.height}/>
      
      <div
        style={{
          cursor: "pointer",
          fontFamily: "Arial, sans-serif",
          margin: "5px",
          marginTop: "1px",
          padding: "5px",
          border: "1px solid #ddd",
          borderRadius: "5px",
          maxWidth: internalOptions.extent.width -16
        }}
        width={internalOptions.extent.width}
        onClick={toggleVisibility}
      >
        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333", }}> Click to show Full Instructions</div>
        {isVisible && (
          <div style={{fontSize: "14px", color: "#666", marginTop: "5px", }} width={internalOptions.extent.width}>
            Click on a node to highlight it.
            <br />
            Clicking on a node while holding down the Control key marks the node in yellow, 
            and clicking on another node while holding down the Control key again displays the shortest path between the two selected nodes. 
            This shortest path is calculated by Dijkstra's algorithm.
            {/* <div>
            <a href="/home/student/公開/naManual.pdf" target="_blank" rel="noopener noreferrer">
              PDFを表示
            </a>
            </div>     */}
          </div>
        )}
      </div>
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
