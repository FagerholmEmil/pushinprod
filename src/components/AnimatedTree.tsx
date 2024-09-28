'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import data from '../app/data.json';
import { useSetAtom } from 'jotai';
import { selectedFileAtom } from '../app/state';

interface Node {
  id: string;
  active: boolean;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

export const AnimatedTree: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const setSelectedFile = useSetAtom(selectedFileAtom);
  const [scannedNodes, setScannedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll('*').remove();

    const svgWidth = window.innerWidth;
    const svgHeight = window.innerHeight;

    const svg = d3
      .select(svgRef.current)
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: d3.D3ZoomEvent<any, any>) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create a Set of all unique node IDs
    const nodeIds = new Set<string>();
    Object.keys(data).forEach((file) => {
      nodeIds.add(file);
      data[file].dependencies.forEach((dep) => nodeIds.add(dep));
    });

    // Modify the nodes creation
    const nodes: Node[] = Array.from(nodeIds).map((id) => ({
      id,
      active: true, // All nodes are potentially active now
    }));

    // Create links array
    const links: Link[] = [];
    Object.entries(data).forEach(([file, { dependencies }]) => {
      dependencies.forEach((dep) => {
        links.push({
          source: file,
          target: dep,
          value: 1,
        });
      });
    });

    // Calculate the degree (number of connections) for each node
    const nodeDegrees: { [key: string]: number } = {};
    links.forEach((link) => {
      nodeDegrees[link.source as string] =
        (nodeDegrees[link.source as string] || 0) + 1;
      nodeDegrees[link.target as string] =
        (nodeDegrees[link.target as string] || 0) + 1;
    });

    // Define a scale for node sizes
    const nodeScale = d3
      .scaleLinear()
      .domain([
        d3.min(Object.values(nodeDegrees)) || 1,
        d3.max(Object.values(nodeDegrees)) || 1,
      ])
      .range([6, 50]); // Adjust min and max sizes as needed

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2));

    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value));

    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d: any) => nodeScale(nodeDegrees[d.id] || 1))
      .attr('fill', '#808080') // Start all nodes as gray
      .attr('data-id', (d: any) => d.id)
      .call(drag(simulation));

    node.on('click', handleNodeClick);

    // Create a tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'black')
      .style('color', 'white')
      .style('padding', '5px')
      .style('border-radius', '5px');

    node
      .on('mouseover', (event: MouseEvent, d: any) => {
        tooltip
          .style('visibility', 'visible')
          .text(`${d.id} (Connections: ${nodeDegrees[d.id] || 0})`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mousemove', (event: MouseEvent) => {
        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    // Update the scanNodes function
    let currentIndex = 0;
    function scanNodes() {
      const currentNode = nodes[currentIndex];
      setScannedNodes(prev => new Set(prev).add(currentNode.id));

      node.attr('fill', (d: any) => 
        scannedNodes.has(d.id) ? '#00ff00' : '#808080'
      );

      currentIndex = (currentIndex + 1) % nodes.length;
      setTimeout(scanNodes, 100); // Adjust the speed of scanning here
    }

    scanNodes();

    function handleNodeClick(event: MouseEvent, d: any) {
      const clickedNode = d3.select(event.currentTarget);
      const isSelected = clickedNode.classed('selected');

      // Update the selectedFileAtom
      setSelectedFile(d.id);

      // Reset all nodes and links
      node
        .attr('fill', (n: any) => scannedNodes.has(n.id) ? '#00ff00' : '#808080')
        .attr('opacity', 1)
        .classed('selected', false);
      link.attr('stroke', '#999').attr('opacity', 0.6);

      if (!isSelected) {
        // Highlight selected node and its connections
        clickedNode.classed('selected', true).attr('fill', '#00ff00');

        const connectedNodes = new Set<string>([d.id]);
        link.each((l: any) => {
          if (l.source.id === d.id) connectedNodes.add(l.target.id);
          if (l.target.id === d.id) connectedNodes.add(l.source.id);
        });

        node
          .attr('fill', (n: any) =>
            connectedNodes.has(n.id) ? '#00ff00' : 
            scannedNodes.has(n.id) ? '#008000' : '#808080'
          )
          .attr('opacity', (n: any) => (connectedNodes.has(n.id) ? 1 : 0.3));

        link
          .attr('stroke', (l: any) =>
            l.source.id === d.id || l.target.id === d.id ? '#ff0000' : '#999'
          )
          .attr('opacity', (l: any) =>
            l.source.id === d.id || l.target.id === d.id ? 1 : 0.1
          );
      }
    }

    // Handle Escape key press
    d3.select('body').on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        node
          .attr('fill', (d: any) => d.active ? '#00ff00' : '#808080')
          .attr('opacity', 1)
          .classed('selected', false);
        link.attr('stroke', '#999').attr('opacity', 0.6);
      }
    });

    function drag(
      simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>
    ) {
      function dragstarted(event: d3.D3DragEvent<any, any, any>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: d3.D3DragEvent<any, any, any>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: d3.D3DragEvent<any, any, any>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
    });
  }, [setSelectedFile, scannedNodes]);

  return (
    <div className="w-screen h-screen bg-black">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};