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
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragNode(null);
      setDragOffset({ x: 0, y: 0 });
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
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
      cursor: isDragging ? 'grabbing' : 'pointer'
    };

    if (selectedNode === nodeId) {
      baseStyle.stroke = '#007bff';
      baseStyle.strokeWidth = 3;
    }

    if (edgeStartNode === nodeId) {
      baseStyle.fill = '#ffc107';
      baseStyle.stroke = '#e0a800';
    }

    if (currentStepData) {
      if (currentStepData.currentNode === nodeId) {
        baseStyle.fill = '#ffc107';
        baseStyle.stroke = '#333';
        baseStyle.strokeWidth = 4;
      } else if (currentStepData.visited && currentStepData.visited.has(nodeId)) {
        baseStyle.fill = '#28a745';
        baseStyle.stroke = '#1e7e34';
      }
    }

    return baseStyle;
  }, [selectedNode, edgeStartNode, currentStepData, isDragging]);

  // Get edge style based on current algorithm step
  const getEdgeStyle = useCallback((node1, node2) => {
    const baseStyle = {
      stroke: '#6c757d',
      strokeWidth: 2,
      cursor: 'pointer'
    };

    if (currentStepData && currentStepData.parent) {
      const parent1 = currentStepData.parent.get(node1);
      const parent2 = currentStepData.parent.get(node2);
      
      if (parent1 === node2 || parent2 === node1) {
        baseStyle.stroke = '#28a745';
        baseStyle.strokeWidth = 3;
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
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          minWidth: '120px'
        }}
      >
        {contextMenu.nodeId && (
          <div>
            <button
              className="button"
              style={{ width: '100%', margin: 0, borderRadius: 0 }}
              onClick={() => {
                onRemoveNode(contextMenu.nodeId);
                setContextMenu(null);
              }}
            >
              Remove Node
            </button>
          </div>
        )}
        {contextMenu.edge && (
          <div>
            <button
              className="button danger"
              style={{ width: '100%', margin: 0, borderRadius: 0 }}
              onClick={() => {
                onRemoveEdge(contextMenu.edge[0], contextMenu.edge[1]);
                setContextMenu(null);
              }}
            >
              Remove Edge
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="graph-container" style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        className="graph-svg"
        width="100%"
        height="600px"
        onClick={handleSvgClick}
        style={{ 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          cursor: isAddingEdge ? 'crosshair' : 'default'
        }}
      >
        {/* Grid pattern for better UX */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dee2e6" strokeWidth="0.5" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
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
            x2={nodePositions.get(edgeStartNode)?.x || 0}
            y2={nodePositions.get(edgeStartNode)?.y || 0}
            stroke="#ffc107"
            strokeWidth="2"
            strokeDasharray="5,5"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>
      
      {/* Interaction hints */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.9)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {isAddingEdge ? (
          <span style={{ color: '#e0a800' }}>
            🔗 Click on a second node to create an edge
          </span>
        ) : (
          <span style={{ color: '#666' }}>
            💡 Click to add nodes • Drag to move • Right-click for options
          </span>
        )}
      </div>
      
      {/* Algorithm step info */}
      {currentStepData && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.9rem',
          maxWidth: '300px'
        }}>
          {currentStepData.action}
        </div>
      )}
      
      {renderContextMenu()}
    </div>
  );
};

export default GraphVisualization; 