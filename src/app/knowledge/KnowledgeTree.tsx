'use client'

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import data from './data.json';

interface Node {
  id: string;
  group: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

const KnowledgeTree: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Use window dimensions instead of fixed values
    const svgWidth = window.innerWidth;
    const svgHeight = window.innerHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    // Clear any existing content
    svg.selectAll('*').remove();

    // Create a group for the graph
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: d3.D3ZoomEvent<any, any>) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Fit the graph to the SVG
    const fitGraph = () => {
      const bounds = g.node().getBBox();
      const fullWidth = svgWidth;
      const fullHeight = svgHeight;
      const boundWidth = bounds.width;
      const boundHeight = bounds.height;
      const midX = bounds.x + boundWidth / 2;
      const midY = bounds.y + boundHeight / 2;
      const scale = 0.8 / Math.max(boundWidth / fullWidth, boundHeight / fullHeight);
      const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

      svg.call(zoom.transform, d3.zoomIdentity
        .translate(translate[0], translate[1])
        .scale(scale));
    };

    // Create a Set of all unique node IDs
    const nodeIds = new Set<string>();
    Object.keys(data).forEach(file => {
      nodeIds.add(file);
      (data as Record<string, string[]>)[file].forEach(dep => nodeIds.add(dep));
    });

    // Create nodes array
    const nodes: Node[] = Array.from(nodeIds).map((id, index) => ({
      id,
      group: index % 5 // Assign a group for coloring
    }));

    // Create links array
    const links: Link[] = [];
    Object.entries(data).forEach(([file, dependencies]) => {
      dependencies.forEach(dep => {
        links.push({
          source: file,
          target: dep,
          value: 1
        });
      });
    });

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2));

    // Create a tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'black')
      .style('border', 'solid')
      .style('border-width', '1px')
      .style('border-radius', '5px')
      .style('padding', '10px')
      .style('color', 'white'); // Add this line to set text color to black

    // Move link and node creation inside the 'g' group
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value));

    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', (d: any) => d3.schemeCategory10[d.group])
      .on('mouseover', (event: MouseEvent, d: any) => {
        tooltip.style('visibility', 'visible')
          .text(d.id);
      })
      .on('mousemove', (event: MouseEvent) => {
        tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    simulation.on('end', fitGraph);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

  }, []);

  return (
    <div className="w-screen h-screen bg-black">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default KnowledgeTree;
