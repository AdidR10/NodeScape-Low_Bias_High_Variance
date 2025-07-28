import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Square, RotateCcw } from 'lucide-react';

const ControlPanel = ({
  graph,
  currentAlgorithm,
  setCurrentAlgorithm,
  algorithmSteps,
  currentStepIndex,
  setCurrentStepIndex,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  startNode,
  setStartNode,
  selectedNode,
  isAddingEdge,
  setIsAddingEdge,
  showInstructions,
  setShowInstructions,
  onRunAlgorithm,
  onLoadPreset,
  onResetVisualization,
  onClearGraph,
  currentStepData
}) => {
  const nodes = graph.getNodes();
  const stats = graph.getStatistics();

  // Playback control handlers
  const handlePlay = () => {
    if (algorithmSteps.length === 0) {
      onRunAlgorithm();
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
  };

  const handleStepForward = () => {
    if (currentStepIndex < algorithmSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > -1) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSpeedChange = (e) => {
    setPlaybackSpeed(parseInt(e.target.value));
  };

  // Algorithm info
  const algorithmInfo = {
    'bfs': {
      name: 'Breadth-First Search (BFS)',
      description: 'Explores nodes level by level using a queue. Guarantees shortest path in unweighted graphs.',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)'
    },
    'dfs': {
      name: 'Depth-First Search (DFS) - Iterative',
      description: 'Explores as far as possible along each branch using a stack before backtracking.',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)'
    },
    'dfs-recursive': {
      name: 'Depth-First Search (DFS) - Recursive',
      description: 'Explores using function call stack. Shows recursive call structure.',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)'
    }
  };

  const currentAlgorithmInfo = algorithmInfo[currentAlgorithm];

  return (
    <div className="control-panel">
      {/* Instructions */}
      {showInstructions && (
        <div className="control-section">
          <div className="instructions">
            <h4>How to Use</h4>
            <ul>
              <li>Click on empty space to add nodes</li>
              <li>Drag nodes to reposition them</li>
              <li>Use "Add Edge" mode to connect nodes</li>
              <li>Right-click on nodes/edges to delete</li>
              <li>Select start node and algorithm</li>
              <li>Click "Run Algorithm" to begin</li>
            </ul>
            <button 
              className="button secondary"
              onClick={() => setShowInstructions(false)}
              style={{ fontSize: '0.8rem', padding: '0.5rem' }}
            >
              Hide Instructions
            </button>
          </div>
        </div>
      )}

      {/* Algorithm Selection */}
      <div className="control-section">
        <h3 className="section-title">Algorithm</h3>
        <div className="input-group">
          <label className="input-label">Select Algorithm:</label>
          <select 
            className="input-field"
            value={currentAlgorithm}
            onChange={(e) => setCurrentAlgorithm(e.target.value)}
          >
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS) - Iterative</option>
            <option value="dfs-recursive">Depth-First Search (DFS) - Recursive</option>
          </select>
        </div>

        <div className="algorithm-info">
          <h4>{currentAlgorithmInfo.name}</h4>
          <p>{currentAlgorithmInfo.description}</p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            <div><strong>Time:</strong> {currentAlgorithmInfo.timeComplexity}</div>
            <div><strong>Space:</strong> {currentAlgorithmInfo.spaceComplexity}</div>
          </div>
        </div>
      </div>

      {/* Start Node Selection */}
      <div className="control-section">
        <h3 className="section-title">Configuration</h3>
        <div className="input-group">
          <label className="input-label">Start Node:</label>
          <select 
            className="input-field"
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            disabled={nodes.length === 0}
          >
            {nodes.map(node => (
              <option key={node} value={node}>{node}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">
            Animation Speed: {playbackSpeed}ms
          </label>
          <input
            type="range"
            className="slider"
            min="100"
            max="2000"
            step="100"
            value={playbackSpeed}
            onChange={handleSpeedChange}
          />
        </div>
      </div>

      {/* Algorithm Controls */}
      <div className="control-section">
        <h3 className="section-title">Controls</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <button 
            className="button"
            onClick={onRunAlgorithm}
            disabled={nodes.length === 0}
          >
            Run Algorithm
          </button>
          <button 
            className="button secondary"
            onClick={onResetVisualization}
            disabled={algorithmSteps.length === 0}
          >
            <RotateCcw size={16} style={{ marginRight: '0.5rem' }} />
            Reset
          </button>
        </div>

        {/* Playback Controls */}
        {algorithmSteps.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <button 
                className="button secondary"
                onClick={handleStepBackward}
                disabled={currentStepIndex <= -1}
              >
                <SkipBack size={16} />
              </button>
              
              <button 
                className="button"
                onClick={handlePlay}
                disabled={currentStepIndex >= algorithmSteps.length - 1 && !isPlaying}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              
              <button 
                className="button secondary"
                onClick={handleStop}
              >
                <Square size={16} />
              </button>
              
              <button 
                className="button secondary"
                onClick={handleStepForward}
                disabled={currentStepIndex >= algorithmSteps.length - 1}
              >
                <SkipForward size={16} />
              </button>
            </div>
            
            <div className="input-group">
              <label className="input-label">
                Step: {currentStepIndex + 1} / {algorithmSteps.length}
              </label>
              <input
                type="range"
                className="slider"
                min="-1"
                max={algorithmSteps.length - 1}
                value={currentStepIndex}
                onChange={(e) => setCurrentStepIndex(parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Graph Operations */}
      <div className="control-section">
        <h3 className="section-title">Graph Operations</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <button 
            className={`button ${isAddingEdge ? 'success' : 'secondary'}`}
            onClick={() => setIsAddingEdge(!isAddingEdge)}
          >
            {isAddingEdge ? 'Cancel Edge' : 'Add Edge'}
          </button>
          <button 
            className="button danger"
            onClick={onClearGraph}
          >
            Clear Graph
          </button>
        </div>

        {selectedNode && (
          <div style={{ 
            background: '#e3f2fd', 
            padding: '0.75rem', 
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
            <strong>Selected:</strong> Node {selectedNode}
            <br />
            <strong>Degree:</strong> {graph.getDegree(selectedNode)}
            <br />
            <strong>Neighbors:</strong> {graph.getNeighbors(selectedNode).join(', ') || 'None'}
          </div>
        )}
      </div>

      {/* Graph Presets */}
      <div className="control-section">
        <h3 className="section-title">Graph Presets</h3>
        <div className="preset-buttons">
          <button className="preset-button button" onClick={() => onLoadPreset('linear')}>
            Linear
          </button>
          <button className="preset-button button" onClick={() => onLoadPreset('binary-tree')}>
            Binary Tree
          </button>
          <button className="preset-button button" onClick={() => onLoadPreset('complete')}>
            Complete
          </button>
          <button className="preset-button button" onClick={() => onLoadPreset('cycle')}>
            Cycle
          </button>
          <button className="preset-button button" onClick={() => onLoadPreset('star')}>
            Star
          </button>
          <button className="preset-button button" onClick={() => onLoadPreset('grid')}>
            Grid
          </button>
        </div>
      </div>

      {/* Graph Statistics */}
      <div className="control-section">
        <h3 className="section-title">Graph Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Nodes</div>
            <div className="stat-value">{stats.nodeCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Edges</div>
            <div className="stat-value">{stats.edgeCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Connected</div>
            <div className="stat-value">{stats.isConnected ? 'Yes' : 'No'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Max Degree</div>
            <div className="stat-value">{stats.maxDegree}</div>
          </div>
        </div>
      </div>

      {/* Algorithm State Display */}
      {currentStepData && (
        <div className="control-section">
          <h3 className="section-title">Algorithm State</h3>
          
          {currentStepData.currentNode && (
            <div className="algorithm-info">
              <h4>Current Node: {currentStepData.currentNode}</h4>
              <p>Visited Nodes: {Array.from(currentStepData.visited || []).join(', ') || 'None'}</p>
            </div>
          )}

          {/* Queue/Stack Display */}
          {(currentStepData.queue || currentStepData.stack || currentStepData.callStack) && (
            <div className="queue-stack-display">
              <h4>
                {currentStepData.queue ? 'Queue' : 
                 currentStepData.stack ? 'Stack' : 'Call Stack'}:
              </h4>
              <div className="queue-stack-items">
                {(currentStepData.queue || currentStepData.stack || currentStepData.callStack || []).map((item, index) => (
                  <span 
                    key={index} 
                    className={`${currentStepData.queue ? 'queue-item' : 'stack-item'} ${
                      item === currentStepData.currentNode ? 'current-node' : ''
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
              {(currentStepData.queue || currentStepData.stack || currentStepData.callStack || []).length === 0 && (
                <span style={{ color: '#666', fontSize: '0.9rem' }}>Empty</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ControlPanel; 