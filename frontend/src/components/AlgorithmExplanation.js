import React from 'react';

const AlgorithmExplanation = ({
  currentAlgorithm,
  currentStepData,
  algorithmSteps,
  currentStepIndex,
  visitedOrder,
  isPlaying
}) => {
  const getAlgorithmDescription = () => {
    switch (currentAlgorithm) {
      case 'bfs':
        return {
          name: 'Breadth-First Search (BFS)',
          description: 'Explores nodes level by level using a queue (FIFO - First In, First Out). It visits all nodes at the current depth before moving to nodes at the next depth level.',
          dataStructure: 'Queue',
          strategy: 'Level-by-level exploration'
        };
      case 'dfs':
        return {
          name: 'Depth-First Search (DFS) - Iterative',
          description: 'Explores as far as possible along each branch before backtracking, using a stack (LIFO - Last In, First Out).',
          dataStructure: 'Stack',
          strategy: 'Depth-first exploration with backtracking'
        };
      case 'dfs-recursive':
        return {
          name: 'Depth-First Search (DFS) - Recursive',
          description: 'Uses the function call stack for recursion, exploring deeply before backtracking through function returns.',
          dataStructure: 'Call Stack',
          strategy: 'Recursive depth-first exploration'
        };
      default:
        return {
          name: 'Algorithm',
          description: 'Select an algorithm to see detailed explanation.',
          dataStructure: 'N/A',
          strategy: 'N/A'
        };
    }
  };

  const getCurrentStepExplanation = () => {
    if (!currentStepData) return null;

    const explanations = {
      start: `🚀 Starting ${getAlgorithmDescription().name} from node ${currentStepData.currentNode}. The ${getAlgorithmDescription().dataStructure.toLowerCase()} is initialized with the starting node.`,
      visit: `🎯 Visiting node ${currentStepData.currentNode}. This node is now marked as visited and will be colored green. We're exploring its neighbors next.`,
      enqueue: `➕ Adding neighbor ${currentStepData.neighbor} to the ${getAlgorithmDescription().dataStructure.toLowerCase()}. This node will be processed later in the order it was added.`,
      complete: `✅ Algorithm completed! All reachable nodes have been visited. The traversal order shows the sequence in which nodes were explored.`
    };

    return explanations[currentStepData.type] || `Processing step: ${currentStepData.action}`;
  };

  const getDataStructureState = () => {
    if (!currentStepData) return null;

    if (currentStepData.queue) {
      return {
        name: 'Queue (FIFO)',
        items: currentStepData.queue,
        description: 'Nodes are added to the back and removed from the front'
      };
    } else if (currentStepData.stack) {
      return {
        name: 'Stack (LIFO)',
        items: currentStepData.stack,
        description: 'Nodes are added and removed from the top'
      };
    } else if (currentStepData.callStack) {
      return {
        name: 'Call Stack',
        items: currentStepData.callStack,
        description: 'Function calls are stacked, with returns happening in reverse order'
      };
    }
    return null;
  };

  const algorithmInfo = getAlgorithmDescription();
  const dataStructureState = getDataStructureState();

  return (
    <div className="explanation-panel">
      <h3 className="section-title">Algorithm Explanation</h3>
      
      {/* Algorithm Overview */}
      <div className="algorithm-state">
        <h4 style={{ color: '#64b5f6', marginBottom: '0.5rem' }}>{algorithmInfo.name}</h4>
        <p style={{ color: '#b0b0b0', marginBottom: '1rem', lineHeight: '1.5' }}>
          {algorithmInfo.description}
        </p>
        
        <div className="state-item">
          <span className="state-label">Data Structure:</span>
          <span className="state-value">{algorithmInfo.dataStructure}</span>
        </div>
        <div className="state-item">
          <span className="state-label">Strategy:</span>
          <span className="state-value">{algorithmInfo.strategy}</span>
        </div>
      </div>

      {/* Current Step Explanation */}
      {currentStepData && (
        <div className={`explanation-step ${isPlaying ? 'current-action' : ''}`}>
          <h4>Current Step {currentStepIndex + 1}</h4>
          <p>{getCurrentStepExplanation()}</p>
          {currentStepData.currentNode && (
            <div className="state-item">
              <span className="state-label">Current Node:</span>
              <span className="state-value" style={{ 
                color: '#ffc107', 
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                padding: '2px 6px',
                borderRadius: '4px',
                marginLeft: '0.5rem'
              }}>
                {currentStepData.currentNode}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Data Structure State */}
      {dataStructureState && (
        <div className="algorithm-state">
          <h4 style={{ color: '#64b5f6', marginBottom: '0.5rem' }}>{dataStructureState.name}</h4>
          <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            {dataStructureState.description}
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.25rem',
            marginTop: '0.5rem' 
          }}>
            {dataStructureState.items.length > 0 ? (
              dataStructureState.items.map((item, index) => (
                <span 
                  key={index}
                  style={{
                    backgroundColor: item === currentStepData?.currentNode ? '#4caf50' : '#64b5f6',
                    color: '#1a1a1a',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}
                >
                  {item}
                </span>
              ))
            ) : (
              <span style={{ color: '#999', fontSize: '0.8rem', fontStyle: 'italic' }}>
                Empty
              </span>
            )}
          </div>
        </div>
      )}

      {/* Visited Nodes */}
      {currentStepData?.visited && currentStepData.visited.size > 0 && (
        <div className="algorithm-state">
          <h4 style={{ color: '#4caf50', marginBottom: '0.5rem' }}>
            Visited Nodes ({currentStepData.visited.size})
          </h4>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.25rem' 
          }}>
            {Array.from(currentStepData.visited).map((node, index) => (
              <span 
                key={index}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}
              >
                {node}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Final Traversal Order */}
      {visitedOrder && visitedOrder.length > 0 && algorithmSteps.length > 0 && currentStepIndex >= algorithmSteps.length - 1 && (
        <div className="explanation-step">
          <h4>🎉 Traversal Complete!</h4>
          <p>Final traversal order: <strong>{visitedOrder.join(' → ')}</strong></p>
          <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
            This represents the order in which the algorithm visited each node during the traversal.
          </p>
        </div>
      )}

      {/* Algorithm Progress */}
      {algorithmSteps.length > 0 && (
        <div className="algorithm-state">
          <h4 style={{ color: '#64b5f6', marginBottom: '0.5rem' }}>Progress</h4>
          <div className="state-item">
            <span className="state-label">Step:</span>
            <span className="state-value">{Math.max(0, currentStepIndex + 1)} of {algorithmSteps.length}</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '2px',
            marginTop: '0.5rem',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((currentStepIndex + 1) / algorithmSteps.length) * 100}%`,
              height: '100%',
              backgroundColor: '#64b5f6',
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.03)', 
        borderRadius: '8px', 
        padding: '1rem',
        marginTop: '1rem'
      }}>
        <h4 style={{ color: '#64b5f6', marginBottom: '0.5rem', fontSize: '0.9rem' }}>💡 Tips</h4>
        <ul style={{ fontSize: '0.8rem', color: '#b0b0b0', marginLeft: '1rem' }}>
          <li>Use arrow keys (← →) to step through the algorithm manually</li>
          <li>Press Space to play/pause the animation</li>
          <li>Watch how the {algorithmInfo.dataStructure.toLowerCase()} changes with each step</li>
          <li>Green nodes are visited, yellow is currently being processed</li>
        </ul>
      </div>
    </div>
  );
};

export default AlgorithmExplanation; 