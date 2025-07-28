// Graph export/import utilities

export const GraphExport = {
  // Export graph to JSON file
  exportToFile(graph, nodePositions, filename = 'graph.json') {
    const data = {
      graph: graph.toJSON(),
      nodePositions: Object.fromEntries(nodePositions),
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        nodeCount: graph.getNodes().length,
        edgeCount: graph.getEdges().length
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
  
  // Import graph from JSON file
  importFromFile(file, callback) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!data.graph || !data.nodePositions) {
          throw new Error('Invalid file format');
        }
        
        // Convert nodePositions back to Map
        const nodePositions = new Map(Object.entries(data.nodePositions));
        
        callback(null, {
          graphData: data.graph,
          nodePositions: nodePositions,
          metadata: data.metadata || {}
        });
      } catch (error) {
        callback(error, null);
      }
    };
    
    reader.onerror = () => {
      callback(new Error('Failed to read file'), null);
    };
    
    reader.readAsText(file);
  },
  
  // Export to URL (for sharing)
  exportToURL(graph, nodePositions) {
    const data = {
      graph: graph.toJSON(),
      nodePositions: Object.fromEntries(nodePositions)
    };
    
    const encoded = btoa(JSON.stringify(data));
    const url = new URL(window.location);
    url.searchParams.set('graph', encoded);
    
    return url.toString();
  },
  
  // Import from URL
  importFromURL() {
    const url = new URL(window.location);
    const graphParam = url.searchParams.get('graph');
    
    if (!graphParam) {
      return null;
    }
    
    try {
      const data = JSON.parse(atob(graphParam));
      const nodePositions = new Map(Object.entries(data.nodePositions));
      
      return {
        graphData: data.graph,
        nodePositions: nodePositions
      };
    } catch (error) {
      console.error('Failed to import graph from URL:', error);
      return null;
    }
  },
  
  // Generate a shareable link
  generateShareLink(graph, nodePositions) {
    return this.exportToURL(graph, nodePositions);
  },
  
  // Export algorithm steps to JSON (for analysis)
  exportSteps(algorithmSteps, algorithmName, startNode) {
    const data = {
      algorithm: algorithmName,
      startNode: startNode,
      steps: algorithmSteps.map(step => ({
        type: step.type,
        action: step.action,
        currentNode: step.currentNode,
        visited: Array.from(step.visited || []),
        queue: step.queue || [],
        stack: step.stack || [],
        callStack: step.callStack || []
      })),
      metadata: {
        totalSteps: algorithmSteps.length,
        exportDate: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${algorithmName}_steps_${startNode}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}; 