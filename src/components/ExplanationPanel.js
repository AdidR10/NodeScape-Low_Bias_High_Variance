import React from 'react';

const ExplanationPanel = ({ 
  currentAlgorithm, 
  currentStepData, 
  algorithmSteps, 
  currentStepIndex,
  graph
}) => {
  const getAlgorithmName = () => {
    const names = {
      'bfs': 'Breadth-First Search (BFS)',
      'dfs': 'Depth-First Search (DFS) - Iterative',
      'dfs-recursive': 'Depth-First Search (DFS) - Recursive'
    };
    return names[currentAlgorithm] || 'Breadth-First Search (BFS)';
  };

  const getCurrentStatus = () => {
    if (!currentStepData) {
      return {
        status: 'Ready',
        message: 'Select start node and run algorithm'
      };
    }

    const action = currentStepData.action?.toLowerCase() || '';
    const currentNode = currentStepData.currentNode;

    if (action.includes('initializ')) {
      return {
        status: 'Initializing',
        message: `Starting from node ${currentStepData.startNode}`
      };
    } else if (action.includes('visit')) {
      return {
        status: 'Visiting',
        message: `Processing node ${currentNode}`
      };
    } else if (action.includes('explor')) {
      return {
        status: 'Exploring',
        message: `Adding neighbors of ${currentNode}`
      };
    } else if (action.includes('backtrack')) {
      return {
        status: 'Backtracking',
        message: `No more neighbors from ${currentNode}`
      };
    } else if (action.includes('complete')) {
      return {
        status: 'Complete',
        message: `Visited ${currentStepData.visited?.size || 0} nodes`
      };
    } else {
      return {
        status: 'Processing',
        message: currentStepData.action || 'Processing step'
      };
    }
  };

  const statusInfo = getCurrentStatus();
  const nodes = graph.getNodes();
  const visitedCount = currentStepData?.visited?.size || 0;

  return (
    <div className="explanation-panel">
      <div className="explanation-content">
        <h3>📊 Real-Time Status</h3>
        
        {/* Current Status */}
        <div className="step-explanation">
          <h4>🎯 Current Status</h4>
          <p><strong>{statusInfo.status}</strong></p>
          <p>{statusInfo.message}</p>
        </div>

        {/* Algorithm Info */}
        <div className="step-explanation">
          <h4>🧮 Algorithm</h4>
          <p>{getAlgorithmName()}</p>
          <p><strong>Progress:</strong> {currentStepIndex + 1} / {algorithmSteps.length}</p>
        </div>

        {/* Graph Stats */}
        <div className="step-explanation">
          <h4>📈 Graph Info</h4>
          <p><strong>Nodes:</strong> {nodes.length}</p>
          <p><strong>Visited:</strong> {visitedCount} / {nodes.length}</p>
          <p><strong>Current:</strong> {currentStepData?.currentNode || 'None'}</p>
        </div>

        {/* Quick Info */}
        <div className="highlight">
          <h4>💡 Quick Info</h4>
          <p>• BFS: Level by level</p>
          <p>• DFS: Deep first</p>
          <p>• Watch the pattern</p>
        </div>
      </div>
    </div>
  );
};

export default ExplanationPanel; 