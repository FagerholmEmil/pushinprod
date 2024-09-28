// @ts-nocheck

'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  repoDataAtom,
  selectedFileAtom,
} from '../app/[github-user]/[github-repo]/state';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  active: boolean;
  x: number;
  y: number;
  radius: number;
  connections: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
  value: number;
}

export const AnimatedTree: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const setSelectedFile = useSetAtom(selectedFileAtom);
  const [scannedNodes, setScannedNodes] = useState<Set<string>>(new Set());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [highlightedNode, setHighlightedNode] = useState<Node | null>(null);
  const [greenNodes, setGreenNodes] = useState<{ [key: string]: string }>({});
  const [highlightedNodeStatus, setHighlightedNodeStatus] =
    useState<string>('');
  const data = useAtomValue(repoDataAtom);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = window.innerWidth;
    const height = window.innerHeight;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    // Create nodes and links
    const nodeIds = new Set<string>();
    const nodeDegrees: { [key: string]: number } = {};
    const newLinks: Link[] = [];

    Object.entries(data).forEach(([file, { dependencies }]) => {
      nodeIds.add(file);
      dependencies.forEach((dep) => {
        nodeIds.add(dep);
        nodeDegrees[file] = (nodeDegrees[file] || 0) + 1;
        nodeDegrees[dep] = (nodeDegrees[dep] || 0) + 1;
        newLinks.push({
          source: file,
          target: dep,
          value: 1,
        } as Link);
      });
    });

    // Filter out nodes with 0 connections
    const connectedNodeIds = Array.from(nodeIds).filter(
      (id) => nodeDegrees[id] > 0
    );

    const nodeScale = d3
      .scaleLinear()
      .domain([
        d3.min(Object.values(nodeDegrees)) || 1,
        d3.max(Object.values(nodeDegrees)) || 1,
      ])
      .range([6, 20]);

    const newNodes: Node[] = connectedNodeIds.map((id) => ({
      id,
      active: true,
      x: width / 2 + (Math.random() - 0.5) * 100, // Center nodes horizontally with some randomness
      y: height / 2 + (Math.random() - 0.5) * 100, // Center nodes vertically with some randomness
      radius: nodeScale(nodeDegrees[id] || 1),
      connections: nodeDegrees[id] || 0,
    }));

    setNodes(newNodes);
    setLinks(newLinks);

    // Create simulation
    const simulation = d3
      .forceSimulation(newNodes)
      .force(
        'link',
        d3
          .forceLink(newLinks)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2)) // Center the force layout
      .force('x', d3.forceX(width / 2).strength(0.1)) // Add horizontal centering force
      .force('y', d3.forceY(height / 2).strength(0.1)); // Add vertical centering force

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Create links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(newLinks)
      .enter()
      .append('line')
      .attr('stroke', '#999999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    // Create nodes
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(newNodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', '#808080')
      .call(drag(simulation));

    // Add click event to nodes
    node.on('click', handleNodeClick);

    // Create tooltip
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

    // Add hover effects
    node
      .on('mouseover', (event, d: Node) => {
        tooltip
          .style('visibility', 'visible')
          .text(`${d.id} (Connections: ${d.connections})`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    });

    // Update the scanNodes function
    function scanNodes() {
      const currentNode = newNodes[currentIndex];
      const status = getRandomStatus();
      const color = getStatusColor(status);

      setScannedNodes((prev) => new Set(prev).add(currentNode.id));
      setGreenNodes((prev) => ({ ...prev, [currentNode.id]: status }));

      node.filter((d) => d.id === currentNode.id).attr('fill', color);

      currentIndex = (currentIndex + 1) % newNodes.length;
      setTimeout(scanNodes, 100);
    }

    // Update the handleNodeClick function
    function handleNodeClick(event: MouseEvent, d: Node) {
      setSelectedNode(d);
      setSelectedFile(d.id);
      setHighlightedNode(d);
      const status = greenNodes[d.id] || getRandomStatus();
      setHighlightedNodeStatus(status);

      // Reset all nodes and links
      node.attr('fill', (n) => {
        const nodeStatus = greenNodes[n.id];
        return nodeStatus ? getStatusColor(nodeStatus) : '#808080';
      });
      link.attr('stroke', '#999999').attr('stroke-opacity', 0.6);

      // Highlight selected node and its connections
      node.filter((n) => n.id === d.id).attr('fill', getStatusColor(status));
      link
        .filter((l) => l.source.id === d.id || l.target.id === d.id)
        .attr('stroke', '#ff0000')
        .attr('stroke-opacity', 1);
    }

    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(
        event: d3.D3DragEvent<SVGCircleElement, Node, Node>
      ) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag<SVGCircleElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => {
      simulation.stop();
      svg.on('.zoom', null);
    };
  }, [setSelectedFile, greenNodes]);

  // Function to generate random status
  const getRandomStatus = () => {
    const statuses = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
  };

  // Update the getStatusColor function to return hex values
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return '#10B981'; // green-500
      case 'Good':
        return '#6EE7B7'; // green-300
      case 'Fair':
        return '#F59E0B'; // yellow-500
      case 'Poor':
        return '#F97316'; // orange-500
      case 'Critical':
        return '#EF4444'; // red-500
      default:
        return '#6B7280'; // gray-500
    }
  };

  // Helper function to get Tailwind classes for status colors
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-green-500';
      case 'Good':
        return 'bg-green-300';
      case 'Fair':
        return 'bg-yellow-500';
      case 'Poor':
        return 'bg-orange-500';
      case 'Critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex w-screen h-screen bg-black">
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div className="absolute top-0 right-0 w-64 h-screen bg-gray-800 text-white p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Highlighted Node</h2>
        {highlightedNode ? (
          <div>
            <p className="mb-2">
              <span className="font-semibold">ID:</span> {highlightedNode.id}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Connections:</span>{' '}
              {highlightedNode.connections}
            </p>
            <div
              className={`w-full h-6 rounded ${getStatusColorClass(highlightedNodeStatus)} flex items-center justify-center mb-2`}
            >
              <span className="text-xs font-bold">{highlightedNodeStatus}</span>
            </div>
            <p className="text-sm">This node is highlighted on the graph</p>
          </div>
        ) : (
          <p>No node selected</p>
        )}
        {!highlightedNode && (
          <h2 className="text-xl font-bold mt-8 mb-4">Click On Node</h2>
        )}
        {Object.entries(greenNodes).map(([id, status]) => (
          <div key={id} className="mb-2">
            <p className="font-semibold">{id}</p>
            <div
              className={`w-full h-6 rounded ${getStatusColorClass(status)} flex items-center justify-center`}
            >
              <span className="text-xs font-bold">{status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
