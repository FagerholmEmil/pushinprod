// @ts-nocheck

'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import data from '../app/data.json';
import { useSetAtom } from 'jotai';
import { selectedFileAtom } from '../app/state';

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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const setSelectedFile = useSetAtom(selectedFileAtom);
    const [scannedNodes, setScannedNodes] = useState<Set<string>>(new Set());
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        // Create nodes and links
        const nodeIds = new Set<string>();
        Object.keys(data).forEach((file) => {
            nodeIds.add(file);
            data[file].dependencies.forEach((dep) => nodeIds.add(dep));
        });

        const nodeDegrees: { [key: string]: number } = {};
        const newLinks: Link[] = [];
        Object.entries(data).forEach(([file, { dependencies }]) => {
            dependencies.forEach((dep) => {
                nodeDegrees[file] = (nodeDegrees[file] || 0) + 1;
                nodeDegrees[dep] = (nodeDegrees[dep] || 0) + 1;
                newLinks.push({
                    source: file,
                    target: dep,
                    value: 1,
                } as Link);
            });
        });

        const nodeScale = d3
            .scaleLinear()
            .domain([
                d3.min(Object.values(nodeDegrees)) || 1,
                d3.max(Object.values(nodeDegrees)) || 1,
            ])
            .range([6, 30]);

        const newNodes: Node[] = Array.from(nodeIds).map((id) => ({
            id,
            active: true,
            x: Math.random() * width,
            y: Math.random() * height,
            radius: nodeScale(nodeDegrees[id] || 1),
            connections: nodeDegrees[id] || 0,
        }));

        setNodes(newNodes);
        setLinks(newLinks);

        // Adjust the force simulation
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
            .force('center', d3.forceCenter(width / 2, height / 2));

        // Handle zoom and pan
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                setTransform(event.transform);
            });

        d3.select(canvas).call(zoom as any);

        // Update node positions on each tick
        simulation.on('tick', () => {
            setNodes([...newNodes]);
            setLinks([...newLinks]);
        });

        // Handle node scanning
        let currentIndex = 0;
        function scanNodes() {
            const currentNode = newNodes[currentIndex];
            setScannedNodes((prev) => new Set(prev).add(currentNode.id));
            currentIndex = (currentIndex + 1) % newNodes.length;
            setTimeout(scanNodes, 100);
        }
        scanNodes();

        // Handle mouse events
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('mousemove', handleCanvasMouseMove);

        return () => {
            simulation.stop();
            canvas.removeEventListener('click', handleCanvasClick);
            canvas.removeEventListener('mousemove', handleCanvasMouseMove);
            d3.select(canvas).on('.zoom', null);
        };
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply zoom and pan transformation
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        // Draw links
        links.forEach((link) => {
            ctx.beginPath();
            ctx.moveTo(link.source.x, link.source.y);
            ctx.lineTo(link.target.x, link.target.y);
            ctx.strokeStyle = selectedNode &&
                (link.source.id === selectedNode.id || link.target.id === selectedNode.id)
                ? '#ff0000'
                : '#999999';
            ctx.lineWidth = Math.sqrt(link.value) / transform.k;
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach((node) => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius / transform.k, 0, 2 * Math.PI);
            ctx.fillStyle = scannedNodes.has(node.id)
                ? selectedNode && node.id === selectedNode.id
                    ? '#2BA02B'  // A lighter, more vibrant green for selected nodes
                    : '#03FF00'  // A darker, richer green for scanned nodes
                : '#808080';   // Keeping the original gray for unscanned nodes
            ctx.fill();
        });

        // Draw tooltip if a node is hovered
        if (hoveredNode) {
            const tooltipX = hoveredNode.x * transform.k + transform.x;
            const tooltipY = hoveredNode.y * transform.k + transform.y - hoveredNode.radius - 10;

            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(tooltipX, tooltipY - 30, 200, 30);
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(`${hoveredNode.id} (Connections: ${hoveredNode.connections})`,
                tooltipX + 10, tooltipY + 5);
            ctx.restore();
        }

        ctx.restore();
    }, [nodes, links, scannedNodes, selectedNode, transform]);

    const handleCanvasClick = (event: MouseEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left - transform.x) / transform.k;
        const y = (event.clientY - rect.top - transform.y) / transform.k;

        const clickedNode = nodes.find(
            (node) =>
                Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) <= node.radius / transform.k
        );

        if (clickedNode) {
            setHoveredNode(clickedNode);
            setSelectedNode(clickedNode);
            setSelectedFile(clickedNode.id);
        } else {
            setHoveredNode(null);
            setSelectedNode(null);
            setSelectedFile(null);
        }
    };

    const handleCanvasMouseMove = (event: MouseEvent) => {
        // Implement tooltip logic here if needed
    };

    return (
        <div className="w-screen h-screen bg-black">
            <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
    );
};