import React from 'react';

interface TimingData {
  componentName: string;
  renderTime: number;
  children: TimingData[];
}

interface PerformanceVisualizationProps {
  data: TimingData[];
}

const PerformanceVisualization: React.FC<PerformanceVisualizationProps> = ({ data }) => {
  const renderTree = (node: TimingData, depth = 0) => {
    const color = getColorForRenderTime(node.renderTime);

    return (
      <div key={node.componentName} style={{ marginLeft: `${depth * 20}px` }}>
        <span style={{ color }}>
          {node.componentName} ({node.renderTime.toFixed(2)}ms)
        </span>
        {node.children.map((child) => renderTree(child, depth + 1))}
      </div>
    );
  };

  const getColorForRenderTime = (time: number) => {
    if (time < 5) return 'green';
    if (time < 20) return 'orange';
    return 'red';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'white',
        border: '1px solid #ccc',
        padding: '10px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <h2>Performance Tree</h2>
      {data.map((rootNode) => renderTree(rootNode))}
    </div>
  );
};

export default PerformanceVisualization;