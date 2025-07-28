// Graph algorithms with step-by-step visualization tracking

export class GraphAlgorithms {
  static bfs(graph, startNode) {
    const steps = [];
    const visited = new Set();
    const queue = [startNode];
    const queueStates = [];
    const parent = new Map();
    
    // Initial step
    steps.push({
      type: 'start',
      currentNode: startNode,
      visited: new Set(),
      queue: [startNode],
      action: `Starting BFS from node ${startNode}`,
      parent: new Map()
    });
    
    while (queue.length > 0) {
      const currentNode = queue.shift();
      
      if (visited.has(currentNode)) {
        continue;
      }
      
      // Mark as visited
      visited.add(currentNode);
      
      // Record step
      steps.push({
        type: 'visit',
        currentNode: currentNode,
        visited: new Set(visited),
        queue: [...queue],
        action: `Visiting node ${currentNode}`,
        parent: new Map(parent)
      });
      
      // Get neighbors
      const neighbors = graph.getNeighbors(currentNode) || [];
      
      // Add unvisited neighbors to queue
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && !queue.includes(neighbor)) {
          queue.push(neighbor);
          if (!parent.has(neighbor)) {
            parent.set(neighbor, currentNode);
          }
          
          steps.push({
            type: 'enqueue',
            currentNode: currentNode,
            neighbor: neighbor,
            visited: new Set(visited),
            queue: [...queue],
            action: `Adding neighbor ${neighbor} to queue`,
            parent: new Map(parent)
          });
        }
      }
    }
    
    steps.push({
      type: 'complete',
      currentNode: null,
      visited: new Set(visited),
      queue: [],
      action: 'BFS traversal complete',
      parent: new Map(parent)
    });
    
    return {
      steps,
      visitedOrder: Array.from(visited),
      totalSteps: steps.length
    };
  }
  
  static dfs(graph, startNode) {
    const steps = [];
    const visited = new Set();
    const stack = [startNode];
    const parent = new Map();
    
    // Initial step
    steps.push({
      type: 'start',
      currentNode: startNode,
      visited: new Set(),
      stack: [startNode],
      action: `Starting DFS from node ${startNode}`,
      parent: new Map()
    });
    
    while (stack.length > 0) {
      const currentNode = stack.pop();
      
      if (visited.has(currentNode)) {
        continue;
      }
      
      // Mark as visited
      visited.add(currentNode);
      
      // Record step
      steps.push({
        type: 'visit',
        currentNode: currentNode,
        visited: new Set(visited),
        stack: [...stack],
        action: `Visiting node ${currentNode}`,
        parent: new Map(parent)
      });
      
      // Get neighbors (reverse order for stack to maintain left-to-right traversal)
      const neighbors = (graph.getNeighbors(currentNode) || []).reverse();
      
      // Add unvisited neighbors to stack
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && !stack.includes(neighbor)) {
          stack.push(neighbor);
          if (!parent.has(neighbor)) {
            parent.set(neighbor, currentNode);
          }
          
          steps.push({
            type: 'push',
            currentNode: currentNode,
            neighbor: neighbor,
            visited: new Set(visited),
            stack: [...stack],
            action: `Pushing neighbor ${neighbor} to stack`,
            parent: new Map(parent)
          });
        }
      }
    }
    
    steps.push({
      type: 'complete',
      currentNode: null,
      visited: new Set(visited),
      stack: [],
      action: 'DFS traversal complete',
      parent: new Map(parent)
    });
    
    return {
      steps,
      visitedOrder: Array.from(visited),
      totalSteps: steps.length
    };
  }
  
  static dfsRecursive(graph, startNode) {
    const steps = [];
    const visited = new Set();
    const callStack = [];
    const parent = new Map();
    
    function dfsRecursiveHelper(node, depth = 0) {
      // Add to call stack
      callStack.push(node);
      
      steps.push({
        type: 'enter',
        currentNode: node,
        visited: new Set(visited),
        callStack: [...callStack],
        action: `Entering recursive call for node ${node} (depth ${depth})`,
        parent: new Map(parent),
        depth
      });
      
      // Mark as visited
      visited.add(node);
      
      steps.push({
        type: 'visit',
        currentNode: node,
        visited: new Set(visited),
        callStack: [...callStack],
        action: `Visiting node ${node}`,
        parent: new Map(parent),
        depth
      });
      
      // Visit neighbors
      const neighbors = graph.getNeighbors(node) || [];
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          parent.set(neighbor, node);
          
          steps.push({
            type: 'recurse',
            currentNode: node,
            neighbor: neighbor,
            visited: new Set(visited),
            callStack: [...callStack],
            action: `Recursively calling DFS on neighbor ${neighbor}`,
            parent: new Map(parent),
            depth
          });
          
          dfsRecursiveHelper(neighbor, depth + 1);
        }
      }
      
      // Remove from call stack
      callStack.pop();
      
      steps.push({
        type: 'return',
        currentNode: node,
        visited: new Set(visited),
        callStack: [...callStack],
        action: `Returning from recursive call for node ${node}`,
        parent: new Map(parent),
        depth
      });
    }
    
    // Initial step
    steps.push({
      type: 'start',
      currentNode: startNode,
      visited: new Set(),
      callStack: [],
      action: `Starting recursive DFS from node ${startNode}`,
      parent: new Map(),
      depth: 0
    });
    
    dfsRecursiveHelper(startNode);
    
    steps.push({
      type: 'complete',
      currentNode: null,
      visited: new Set(visited),
      callStack: [],
      action: 'Recursive DFS traversal complete',
      parent: new Map(parent),
      depth: 0
    });
    
    return {
      steps,
      visitedOrder: Array.from(visited),
      totalSteps: steps.length
    };
  }
} 