// Graph data structure with adjacency list representation

export class Graph {
  constructor() {
    this.adjacencyList = new Map();
    this.nodes = new Set();
    this.edges = new Set();
  }
  
  // Add a node to the graph
  addNode(node) {
    if (!this.adjacencyList.has(node)) {
      this.adjacencyList.set(node, []);
      this.nodes.add(node);
    }
  }
  
  // Remove a node and all its edges
  removeNode(node) {
    if (this.adjacencyList.has(node)) {
      // Remove all edges connected to this node
      const neighbors = this.adjacencyList.get(node);
      for (const neighbor of neighbors) {
        this.removeEdge(node, neighbor);
      }
      
      // Remove the node itself
      this.adjacencyList.delete(node);
      this.nodes.delete(node);
    }
  }
  
  // Add an edge between two nodes (undirected)
  addEdge(node1, node2) {
    // Ensure both nodes exist
    this.addNode(node1);
    this.addNode(node2);
    
    // Add edge if it doesn't exist
    if (!this.adjacencyList.get(node1).includes(node2)) {
      this.adjacencyList.get(node1).push(node2);
    }
    if (!this.adjacencyList.get(node2).includes(node1)) {
      this.adjacencyList.get(node2).push(node1);
    }
    
    // Track edge
    const edgeKey = node1 < node2 ? `${node1}-${node2}` : `${node2}-${node1}`;
    this.edges.add(edgeKey);
  }
  
  // Remove an edge between two nodes
  removeEdge(node1, node2) {
    if (this.adjacencyList.has(node1)) {
      const neighbors1 = this.adjacencyList.get(node1);
      const index1 = neighbors1.indexOf(node2);
      if (index1 > -1) {
        neighbors1.splice(index1, 1);
      }
    }
    
    if (this.adjacencyList.has(node2)) {
      const neighbors2 = this.adjacencyList.get(node2);
      const index2 = neighbors2.indexOf(node1);
      if (index2 > -1) {
        neighbors2.splice(index2, 1);
      }
    }
    
    // Remove edge tracking
    const edgeKey = node1 < node2 ? `${node1}-${node2}` : `${node2}-${node1}`;
    this.edges.delete(edgeKey);
  }
  
  // Check if an edge exists between two nodes
  hasEdge(node1, node2) {
    return this.adjacencyList.has(node1) && 
           this.adjacencyList.get(node1).includes(node2);
  }
  
  // Get neighbors of a node
  getNeighbors(node) {
    return this.adjacencyList.get(node) || [];
  }
  
  // Get all nodes
  getNodes() {
    return Array.from(this.nodes);
  }
  
  // Get all edges as pairs
  getEdges() {
    const edgeList = [];
    for (const edgeKey of this.edges) {
      const [node1, node2] = edgeKey.split('-');
      edgeList.push([node1, node2]);
    }
    return edgeList;
  }
  
  // Get degree of a node
  getDegree(node) {
    return this.adjacencyList.has(node) ? this.adjacencyList.get(node).length : 0;
  }
  
  // Check if graph is connected
  isConnected() {
    if (this.nodes.size === 0) return true;
    
    const visited = new Set();
    const stack = [this.getNodes()[0]];
    
    while (stack.length > 0) {
      const current = stack.pop();
      if (!visited.has(current)) {
        visited.add(current);
        const neighbors = this.getNeighbors(current);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }
    
    return visited.size === this.nodes.size;
  }
  
  // Clear the entire graph
  clear() {
    this.adjacencyList.clear();
    this.nodes.clear();
    this.edges.clear();
  }
  
  // Clone the graph
  clone() {
    const newGraph = new Graph();
    
    // Add all nodes
    for (const node of this.nodes) {
      newGraph.addNode(node);
    }
    
    // Add all edges
    for (const [node1, node2] of this.getEdges()) {
      newGraph.addEdge(node1, node2);
    }
    
    return newGraph;
  }
  
  // Get graph statistics
  getStatistics() {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      isConnected: this.isConnected(),
      maxDegree: Math.max(...Array.from(this.nodes).map(node => this.getDegree(node)), 0),
      minDegree: Math.min(...Array.from(this.nodes).map(node => this.getDegree(node)), 0)
    };
  }
  
  // Export graph to JSON
  toJSON() {
    return {
      nodes: Array.from(this.nodes),
      edges: this.getEdges()
    };
  }
  
  // Import graph from JSON
  fromJSON(data) {
    this.clear();
    
    // Add nodes
    for (const node of data.nodes || []) {
      this.addNode(node);
    }
    
    // Add edges
    for (const [node1, node2] of data.edges || []) {
      this.addEdge(node1, node2);
    }
  }

  // Get edges in formatted string for console logging
  getFormattedEdges() {
    const edges = this.getEdges();
    const formattedEdges = edges.map(([node1, node2]) => {
      // Convert letter nodes (A, B, C, ...) to integers (0, 1, 2, ...)
      const convertToInt = (node) => {
        if (typeof node === 'string' && node.length === 1) {
          const charCode = node.charCodeAt(0);
          if (charCode >= 65 && charCode <= 90) { // A-Z
            return charCode - 65; // Convert A=0, B=1, C=2, etc.
          }
        }
        return node; // Return as-is if not a single letter
      };
      
      const intNode1 = convertToInt(node1);
      const intNode2 = convertToInt(node2);
      return `(${intNode1}, ${intNode2})`;
    });
    return `[${formattedEdges.join(', ')}]`;
  }
}

// Utility functions for generating preset graphs
export const GraphPresets = {
  // Linear graph: A-B-C-D-E
  linear(size = 5) {
    const graph = new Graph();
    for (let i = 0; i < size; i++) {
      graph.addNode(String.fromCharCode(65 + i)); // A, B, C, ...
    }
    for (let i = 0; i < size - 1; i++) {
      const node1 = String.fromCharCode(65 + i);
      const node2 = String.fromCharCode(65 + i + 1);
      graph.addEdge(node1, node2);
    }
    return graph;
  },
  
  // Binary tree
  binaryTree(depth = 3) {
    const graph = new Graph();
    const nodes = [];
    
    // Generate nodes for complete binary tree
    for (let i = 0; i < Math.pow(2, depth) - 1; i++) {
      const node = String.fromCharCode(65 + i);
      graph.addNode(node);
      nodes.push(node);
    }
    
    // Add edges (parent-child relationships)
    for (let i = 0; i < nodes.length; i++) {
      const leftChild = 2 * i + 1;
      const rightChild = 2 * i + 2;
      
      if (leftChild < nodes.length) {
        graph.addEdge(nodes[i], nodes[leftChild]);
      }
      if (rightChild < nodes.length) {
        graph.addEdge(nodes[i], nodes[rightChild]);
      }
    }
    
    return graph;
  },
  
  // Complete graph (all nodes connected to all other nodes)
  complete(size = 4) {
    const graph = new Graph();
    const nodes = [];
    
    for (let i = 0; i < size; i++) {
      const node = String.fromCharCode(65 + i);
      graph.addNode(node);
      nodes.push(node);
    }
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        graph.addEdge(nodes[i], nodes[j]);
      }
    }
    
    return graph;
  },
  
  // Cycle graph (nodes connected in a circle)
  cycle(size = 5) {
    const graph = new Graph();
    const nodes = [];
    
    for (let i = 0; i < size; i++) {
      const node = String.fromCharCode(65 + i);
      graph.addNode(node);
      nodes.push(node);
    }
    
    for (let i = 0; i < nodes.length; i++) {
      const nextIndex = (i + 1) % nodes.length;
      graph.addEdge(nodes[i], nodes[nextIndex]);
    }
    
    return graph;
  },
  
  // Star graph (one central node connected to all others)
  star(size = 6) {
    const graph = new Graph();
    const center = 'A';
    graph.addNode(center);
    
    for (let i = 1; i < size; i++) {
      const node = String.fromCharCode(65 + i);
      graph.addNode(node);
      graph.addEdge(center, node);
    }
    
    return graph;
  },
  
  // Grid graph (2D grid structure)
  grid(rows = 3, cols = 3) {
    const graph = new Graph();
    
    // Create nodes
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        graph.addNode(`${i},${j}`);
      }
    }
    
    // Add edges (horizontal and vertical connections)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const current = `${i},${j}`;
        
        // Right neighbor
        if (j < cols - 1) {
          graph.addEdge(current, `${i},${j + 1}`);
        }
        
        // Bottom neighbor
        if (i < rows - 1) {
          graph.addEdge(current, `${i + 1},${j}`);
        }
      }
    }
    
    return graph;
  }
}; 