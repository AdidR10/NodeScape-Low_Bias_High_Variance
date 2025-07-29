import ast
import numpy as np
import networkx as nx
import tensorflow as tf
from spektral.data import Graph
from spektral.layers import GINConv, GlobalAvgPool
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Dropout

# Lightweight GIN definition
class LightGIN(Model):
    def __init__(self, hidden, classes):
        super().__init__()
        self.gin1 = GINConv(hidden, activation="relu")
        self.drop = Dropout(0.3)
        self.gin2 = GINConv(hidden, activation="relu")
        self.pool = GlobalAvgPool()
        self.out = Dense(classes, activation="softmax")

    def call(self, inputs):
        x, a, i = inputs
        x = self.gin1([x, a])
        x = self.drop(x)
        x = self.gin2([x, a])
        x = self.pool([x, i])
        return self.out(x)

# Load trained model
def load_trained_model(weight_path="lightgin_model_weights.h5"):
    model = LightGIN(hidden=32, classes=3)
    dummy_x = tf.random.uniform((5, 8))
    dummy_a = tf.sparse.from_dense(tf.eye(5))
    dummy_i = tf.zeros((5,), dtype=tf.int32)
    model([dummy_x, dummy_a, dummy_i], training=False)
    model.load_weights(weight_path)
    return model

# Preprocess a new edge list string into model input
def preprocess_edgelist(edgelist_str, feature_dim=8):
    edges = ast.literal_eval(edgelist_str)
    G = nx.Graph()
    G.add_edges_from(edges)
    nodes = sorted(G.nodes())
    node_map = {node: idx for idx, node in enumerate(nodes)}
    num_nodes = len(nodes)

    A = np.zeros((num_nodes, num_nodes))
    for u, v in edges:
        A[node_map[u], node_map[v]] = 1
        A[node_map[v], node_map[u]] = 1

    degree = np.array([G.degree(n) for n in nodes]).reshape(-1, 1)
    clustering = np.array([nx.clustering(G, n) for n in nodes]).reshape(-1, 1)
    X = np.concatenate([degree, clustering], axis=1)

    if X.shape[1] < feature_dim:
        X = np.concatenate([X, np.zeros((num_nodes, feature_dim - X.shape[1]))], axis=1)

    x = tf.convert_to_tensor(X, dtype=tf.float32)
    a = tf.sparse.from_dense(tf.convert_to_tensor(A, dtype=tf.float32))
    i = tf.zeros((num_nodes,), dtype=tf.int32)
    return [x, a, i]