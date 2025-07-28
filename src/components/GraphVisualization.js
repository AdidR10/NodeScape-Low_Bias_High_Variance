import React, { useRef, useEffect, useState, useCallback } from 'react';

const GraphVisualization = ({
  graph,
  nodePositions,
  setNodePositions,
  selectedNode,
  isAddingEdge,
  edgeStartNode,
  currentStepData,
  onNodeClick,
  onAddNode,
  onRemoveNode,
  onRemoveEdge
}) => {
  const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const nodeRadius = 25;

  // Handle mouse down on node (start dragging)
  const handleNodeMouseDown = useCallback((e, nodeId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const nodePos = nodePositions.get(nodeId);
    
    if (nodePos) {
      setIsDragging(true);
      setDragNode(nodeId);
      setDragOffset({
        x: mouseX - nodePos.x,
        y: mouseY - nodePos.y
      });
    }
  }, [nodePositions]);

  // Handle mouse move (dragging)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && dragNode && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const newX = Math.max(nodeRadius, Math.min(rect.width - nodeRadius, mouseX - dragOffset.x));
        const newY = Math.max(nodeRadius, Math.min(rect.height - nodeRadius, mouseY - dragOffset.y));
        
        setNodePositions(prev => new Map(prev.set(dragNode, { x: newX, y: newY })));
      }
      
      // Update mouse position for tooltip
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragNode(null);
      setDragOffset({ x: 0, y: 0 });
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragNode, dragOffset, setNodePositions]);

  // Handle SVG click (add node)
  const handleSvgClick = useCallback((e) => {
    if (isDragging || isAddingEdge) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is not on existing node
    const nodes = graph.getNodes();
    const clickOnNode = nodes.some(node => {
      const pos = nodePositions.get(node);
      if (!pos) return false;
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      return distance <= nodeRadius;
    });
    
    if (!clickOnNode) {
      onAddNode(x, y);
    }
  }, [isDragging, isAddingEdge, graph, nodePositions, onAddNode]);

  // Handle node right click (context menu)
  const handleNodeRightClick = useCallback((e, nodeId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = svgRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      nodeId
    });
  }, []);

  // Handle edge right click
  const handleEdgeRightClick = useCallback((e, node1, node2) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = svgRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      edge: [node1, node2]
    });
  }, []);

  // Handle node hover for tooltip
  const handleNodeMouseEnter = useCallback((e, nodeId) => {
    const neighbors = graph.getNeighbors(nodeId);
    const degree = graph.getDegree(nodeId);
    const isStartNode = currentStepData?.startNode === nodeId;
    const isVisited = currentStepData?.visited?.has(nodeId);
    const isCurrent = currentStepData?.currentNode === nodeId;
    
    let status = 'Normal';
    if (isStartNode) status = 'Start Node';
    else if (isCurrent) status = 'Current Node';
    else if (isVisited) status = 'Visited';
    
    setTooltip({
      content: `Node ${nodeId}
Degree: ${degree}
Neighbors: ${neighbors.join(', ') || 'None'}
Status: ${status}`,
      x: e.clientX + 10,
      y: e.clientY - 10
    });
  }, [graph, currentStepData]);

  const handleNodeMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // Close context menu
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Get node style based on current algorithm step
  const getNodeStyle = useCallback((nodeId) => {
    const baseStyle = {
      fill: '#6c757d',
      stroke: '#495057',
      strokeWidth: 2,
      cursor: isDragging ? 'grabbing' : 'pointer',
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
    };

    if (selectedNode === nodeId) {
      baseStyle.stroke = '#00d4ff';
      baseStyle.strokeWidth = 3;
      baseStyle.filter = 'drop-shadow(0 4px 8px rgba(0, 212, 255, 0.3))';
    }

    if (edgeStartNode === nodeId) {
      baseStyle.fill = '#ffc107';
      baseStyle.stroke = '#e0a800';
      baseStyle.filter = 'drop-shadow(0 4px 8px rgba(255, 193, 7, 0.3))';
    }

    if (currentStepData) {
      if (currentStepData.currentNode === nodeId) {
        baseStyle.fill = '#ffc107';
        baseStyle.stroke = '#333';
        baseStyle.strokeWidth = 4;
        baseStyle.filter = 'drop-shadow(0 4px 8px rgba(255, 193, 7, 0.4))';
      } else if (currentStepData.visited && currentStepData.visited.has(nodeId)) {
        baseStyle.fill = '#28a745';
        baseStyle.stroke = '#1e7e34';
        baseStyle.filter = 'drop-shadow(0 4px 8px rgba(40, 167, 69, 0.3))';
      }
      
      // Start node styling
      if (currentStepData.startNode === nodeId) {
        baseStyle.fill = '#00d4ff';
        baseStyle.stroke = '#0099cc';
        baseStyle.filter = 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.5))';
      }
    }

    return baseStyle;
  }, [selectedNode, edgeStartNode, currentStepData, isDragging]);

  // Get edge style based on current algorithm step
  const getEdgeStyle = useCallback((node1, node2) => {
    const baseStyle = {
      stroke: '#666666',
      strokeWidth: 2,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    };

    if (currentStepData && currentStepData.parent) {
      const parent1 = currentStepData.parent.get(node1);
      const parent2 = currentStepData.parent.get(node2);
      
      if (parent1 === node2 || parent2 === node1) {
        baseStyle.stroke = '#28a745';
        baseStyle.strokeWidth = 3;
        baseStyle.filter = 'drop-shadow(0 2px 4px rgba(40, 167, 69, 0.3))';
      }
    }

    return baseStyle;
  }, [currentStepData]);

  // Render edges
  const renderEdges = () => {
    return graph.getEdges().map(([node1, node2], index) => {
      const pos1 = nodePositions.get(node1);
      const pos2 = nodePositions.get(node2);
      
      if (!pos1 || !pos2) return null;

      const edgeStyle = getEdgeStyle(node1, node2);
      
      return (
        <line
          key={`edge-${node1}-${node2}`}
          x1={pos1.x}
          y1={pos1.y}
          x2={pos2.x}
          y2={pos2.y}
          style={edgeStyle}
          onContextMenu={(e) => handleEdgeRightClick(e, node1, node2)}
          onMouseEnter={(e) => {
            setTooltip({
              content: `Edge: ${node1} ↔ ${node2}`,
              x: e.clientX + 10,
              y: e.clientY - 10
            });
          }}
          onMouseLeave={() => setTooltip(null)}
        />
      );
    });
  };

  // Render nodes
  const renderNodes = () => {
    return graph.getNodes().map(nodeId => {
      const position = nodePositions.get(nodeId);
      if (!position) return null;

      const nodeStyle = getNodeStyle(nodeId);
      
      return (
        <g key={`node-${nodeId}`}>
          <circle
            cx={position.x}
            cy={position.y}
            r={nodeRadius}
            style={nodeStyle}
            onMouseDown={(e) => handleNodeMouseDown(e, nodeId)}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDragging) {
                onNodeClick(nodeId);
              }
            }}
            onContextMenu={(e) => handleNodeRightClick(e, nodeId)}
            onMouseEnter={(e) => handleNodeMouseEnter(e, nodeId)}
            onMouseLeave={handleNodeMouseLeave}
          />
          <text
            x={position.x}
            y={position.y}
            className="node-label"
            style={{ pointerEvents: 'none' }}
          >
            {nodeId}
          </text>
        </g>
      );
    });
  };

  // Render context menu
  const renderContextMenu = () => {
    if (!contextMenu) return null;

    return (
      <div
        style={{
          position: 'absolute',
          left: contextMenu.x,
          top: contextMenu.y,
          background: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '140px',
          overflow: 'hidden'
        }}
      >
        {contextMenu.nodeId && (
          <div>
            <button
              className="button danger"
              style={{ 
                width: '100%', 
                margin: 0, 
                borderRadius: 0,
                border: 'none',
                padding: '0.75rem 1rem',
                background: '#dc3545',
                color: 'white',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#c82333'}
              onMouseLeave={(e) => e.target.style.background = '#dc3545'}
              onClick={() => {
                onRemoveNode(contextMenu.nodeId);
                setContextMenu(null);
              }}
            >
              🗑️ Remove Node
            </button>
          </div>
        )}
        {contextMenu.edge && (
          <div>
            <button
              className="button danger"
              style={{ 
                width: '100%', 
                margin: 0, 
                borderRadius: 0,
                border: 'none',
                padding: '0.75rem 1rem',
                background: '#dc3545',
                color: 'white',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#c82333'}
              onMouseLeave={(e) => e.target.style.background = '#dc3545'}
              onClick={() => {
                onRemoveEdge(contextMenu.edge[0], contextMenu.edge[1]);
                setContextMenu(null);
              }}
            >
              🔗 Remove Edge
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render tooltip
  const renderTooltip = () => {
    if (!tooltip) return null;

    return (
      <div
        className="tooltip show"
        style={{
          position: 'fixed',
          left: tooltip.x,
          top: tooltip.y,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '0.75rem',
          borderRadius: '6px',
          fontSize: '0.85rem',
          zIndex: 1000,
          pointerEvents: 'none',
          maxWidth: '250px',
          whiteSpace: 'pre-line',
          lineHeight: '1.4',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {tooltip.content}
      </div>
    );
  };

  return (
    <div className="graph-container" style={{ position: 'relative' }}>
      {/* Graph Header */}
      <div className="graph-header">
        <h2>🎯 Interactive Graph Visualization</h2>
        <p>Click to add nodes • Drag to move • Right-click for options • Hover for info</p>
      </div>
      
      {/* Graph Content */}
      <div className="graph-content">
        <svg
          ref={svgRef}
          className="graph-svg"
          width="100%"
          height="100%"
          onClick={handleSvgClick}
          style={{ 
            background: 'transparent',
            cursor: isAddingEdge ? 'crosshair' : 'default'
          }}
        >
          {/* Render edges first (so they appear behind nodes) */}
          <g className="edges">
            {renderEdges()}
          </g>
          
          {/* Render nodes */}
          <g className="nodes">
            {renderNodes()}
          </g>
          
          {/* Edge preview when adding edge */}
          {isAddingEdge && edgeStartNode && (
            <line
              x1={nodePositions.get(edgeStartNode)?.x || 0}
              y1={nodePositions.get(edgeStartNode)?.y || 0}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="#ffc107"
              strokeWidth="2"
              strokeDasharray="5,5"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </svg>
      </div>
      
      {/* Algorithm step info */}
      {currentStepData && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          maxWidth: '350px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 10
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
            🎯 {currentStepData.action}
          </div>
          {currentStepData.currentNode && (
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              Current: {currentStepData.currentNode} | 
              Visited: {Array.from(currentStepData.visited || []).length} nodes
            </div>
          )}
        </div>
      )}
      
      {renderContextMenu()}
      {renderTooltip()}
    </div>
  );
};

export default GraphVisualization; 