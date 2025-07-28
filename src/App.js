import React, { useState, useCallback, useEffect } from 'react';
import { Graph, GraphPresets } from './utils/graph';
import { GraphAlgorithms } from './utils/graphAlgorithms';
import GraphVisualization from './components/GraphVisualization';
import ControlPanel from './components/ControlPanel';

function App() {
  // Graph state
  const [graph, setGraph] = useState(() => GraphPresets.binaryTree(3));
  const [nodePositions, setNodePositions] = useState(new Map());
  
  // Algorithm state
  const [currentAlgorithm, setCurrentAlgorithm] = useState('bfs');
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500); // milliseconds
  const [startNode, setStartNode] = useState('A');
  
  // UI state
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAddingEdge, setIsAddingEdge] = useState(false);
  const [edgeStartNode, setEdgeStartNode] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Generate automatic layout for nodes
  const generateLayout = useCallback((graph) => {
    const nodes = graph.getNodes();
    const newPositions = new Map();
    
    if (nodes.length === 0) {
      setNodePositions(newPositions);
      return;
    }
    
    // Simple force-directed layout or circular layout
    const centerX = 400;
    const centerY = 300;
    const radius = Math.min(200, 50 + nodes.length * 15);
    
    if (nodes.length === 1) {
      newPositions.set(nodes[0], { x: centerX, y: centerY });
    } else {
      nodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / nodes.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        newPositions.set(node, { x, y });
      });
    }
    
    setNodePositions(newPositions);
  }, []);
  
  // Update layout when graph changes
  useEffect(() => {
    generateLayout(graph);
  }, [graph, generateLayout]);
  
  // Algorithm execution
  const runAlgorithm = useCallback(() => {
    if (!graph.getNodes().includes(startNode)) {
      alert(`Start node "${startNode}" does not exist in the graph!`);
      return;
    }
    
    let result;
    switch (currentAlgorithm) {
      case 'bfs':
        result = GraphAlgorithms.bfs(graph, startNode);
        break;
      case 'dfs':
        result = GraphAlgorithms.dfs(graph, startNode);
        break;
      case 'dfs-recursive':
        result = GraphAlgorithms.dfsRecursive(graph, startNode);
        break;
      default:
        result = GraphAlgorithms.bfs(graph, startNode);
    }
    
    setAlgorithmSteps(result.steps);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
  }, [graph, startNode, currentAlgorithm]);
  
  // Playback control
  useEffect(() => {
    let interval;
    if (isPlaying && currentStepIndex < algorithmSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= algorithmSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, algorithmSteps.length, playbackSpeed]);
  
  // Graph manipulation handlers
  const handleNodeClick = useCallback((nodeId) => {
    if (isAddingEdge) {
      if (edgeStartNode === null) {
        setEdgeStartNode(nodeId);
        setSelectedNode(nodeId);
      } else if (edgeStartNode !== nodeId) {
        // Add edge
        const newGraph = graph.clone();
        newGraph.addEdge(edgeStartNode, nodeId);
        setGraph(newGraph);
        setIsAddingEdge(false);
        setEdgeStartNode(null);
        setSelectedNode(null);
      } else {
        // Cancel edge creation
        setIsAddingEdge(false);
        setEdgeStartNode(null);
        setSelectedNode(null);
      }
    } else {
      setSelectedNode(selectedNode === nodeId ? null : nodeId);
    }
  }, [isAddingEdge, edgeStartNode, selectedNode, graph]);
  
  const handleAddNode = useCallback((x, y) => {
    if (isAddingEdge) return;
    
    // Generate next node name
    const existingNodes = graph.getNodes().sort();
    let nextNodeName = 'A';
    for (let i = 0; i < 26; i++) {
      const testName = String.fromCharCode(65 + i);
      if (!existingNodes.includes(testName)) {
        nextNodeName = testName;
        break;
      }
    }
    
    const newGraph = graph.clone();
    newGraph.addNode(nextNodeName);
    setGraph(newGraph);
    
    // Set position for new node
    setNodePositions(prev => new Map(prev.set(nextNodeName, { x, y })));
  }, [graph, isAddingEdge]);
  
  const handleRemoveNode = useCallback((nodeId) => {
    const newGraph = graph.clone();
    newGraph.removeNode(nodeId);
    setGraph(newGraph);
    
    setNodePositions(prev => {
      const newPos = new Map(prev);
      newPos.delete(nodeId);
      return newPos;
    });
    
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
    
    // Reset algorithm if start node was removed
    if (startNode === nodeId) {
      const remainingNodes = newGraph.getNodes();
      if (remainingNodes.length > 0) {
        setStartNode(remainingNodes[0]);
      }
      setAlgorithmSteps([]);
      setCurrentStepIndex(-1);
    }
  }, [graph, selectedNode, startNode]);
  
  const handleRemoveEdge = useCallback((node1, node2) => {
    const newGraph = graph.clone();
    newGraph.removeEdge(node1, node2);
    setGraph(newGraph);
  }, [graph]);
  
  const loadPreset = useCallback((presetName) => {
    let newGraph;
    switch (presetName) {
      case 'linear':
        newGraph = GraphPresets.linear(5);
        break;
      case 'binary-tree':
        newGraph = GraphPresets.binaryTree(3);
        break;
      case 'complete':
        newGraph = GraphPresets.complete(4);
        break;
      case 'cycle':
        newGraph = GraphPresets.cycle(5);
        break;
      case 'star':
        newGraph = GraphPresets.star(6);
        break;
      case 'grid':
        newGraph = GraphPresets.grid(3, 3);
        break;
      default:
        newGraph = GraphPresets.binaryTree(3);
    }
    
    setGraph(newGraph);
    setStartNode(newGraph.getNodes()[0] || 'A');
    setAlgorithmSteps([]);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
    setSelectedNode(null);
    setIsAddingEdge(false);
    setEdgeStartNode(null);
  }, []);
  
  const resetVisualization = useCallback(() => {
    setAlgorithmSteps([]);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
  }, []);
  
  const clearGraph = useCallback(() => {
    setGraph(new Graph());
    setAlgorithmSteps([]);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
    setSelectedNode(null);
    setIsAddingEdge(false);
    setEdgeStartNode(null);
    setStartNode('A');
  }, []);
  
  // Get current step data for visualization
  const getCurrentStepData = () => {
    if (currentStepIndex >= 0 && currentStepIndex < algorithmSteps.length) {
      return algorithmSteps[currentStepIndex];
    }
    return null;
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Graph Algorithm Visualizer</h1>
        <p className="app-subtitle">
          Interactive visualization of Breadth-First Search (BFS) and Depth-First Search (DFS) algorithms
        </p>
      </header>
      
      <div className="main-content">
        <GraphVisualization
          graph={graph}
          nodePositions={nodePositions}
          setNodePositions={setNodePositions}
          selectedNode={selectedNode}
          isAddingEdge={isAddingEdge}
          edgeStartNode={edgeStartNode}
          currentStepData={getCurrentStepData()}
          onNodeClick={handleNodeClick}
          onAddNode={handleAddNode}
          onRemoveNode={handleRemoveNode}
          onRemoveEdge={handleRemoveEdge}
        />
        
        <ControlPanel
          graph={graph}
          currentAlgorithm={currentAlgorithm}
          setCurrentAlgorithm={setCurrentAlgorithm}
          algorithmSteps={algorithmSteps}
          currentStepIndex={currentStepIndex}
          setCurrentStepIndex={setCurrentStepIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          startNode={startNode}
          setStartNode={setStartNode}
          selectedNode={selectedNode}
          isAddingEdge={isAddingEdge}
          setIsAddingEdge={setIsAddingEdge}
          showInstructions={showInstructions}
          setShowInstructions={setShowInstructions}
          onRunAlgorithm={runAlgorithm}
          onLoadPreset={loadPreset}
          onResetVisualization={resetVisualization}
          onClearGraph={clearGraph}
          currentStepData={getCurrentStepData()}
        />
      </div>
    </div>
  );
}

export default App; 