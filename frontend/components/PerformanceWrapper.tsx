"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PerformanceVisualization from './PerformanceVisualization';

interface TimingData {
  componentName: string;
  renderTime: number;
  children: TimingData[];
}

const PerformanceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timingData, setTimingData] = useState<TimingData[]>([]);

  const wrapComponent = (element: React.ReactElement, parentTiming?: TimingData): React.ReactElement => {
    const componentName = (element.type as Function).name || 'AnonymousComponent';
    const startTime = performance.now();

    const wrappedElement = React.cloneElement(element, {
      ref: (node: any) => {
        if (node) {
          const endTime = performance.now();
          const renderTime = endTime - startTime;

          const newTiming: TimingData = {
            componentName,
            renderTime,
            children: [],
          };

          if (parentTiming) {
            parentTiming.children.push(newTiming);
          } else {
            setTimingData((prev) => [...prev, newTiming]);
          }

          if (element.props.children) {
            React.Children.forEach(element.props.children, (child) => {
              if (React.isValidElement(child)) {
                wrapComponent(child, newTiming);
              }
            });
          }
        }
      },
    });

    return wrappedElement;
  };

  const wrappedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return wrapComponent(child);
    }
    return child;
  });

  return (
    <>
      {wrappedChildren}
      {createPortal(<PerformanceVisualization data={timingData} />, document.body)}
    </>
  );
};

export default PerformanceWrapper;
