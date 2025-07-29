from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from model import load_trained_model, preprocess_edgelist

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])
model = load_trained_model()

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        edgelist_str = data.get("edgelist")

        if not edgelist_str:
            return jsonify({"error": "Missing edgelist"}), 400

        model_input = preprocess_edgelist(edgelist_str)
        prediction = model(model_input, training=False)
        pred_class = int(tf.argmax(prediction, axis=1).numpy()[0])

        return jsonify({"prediction": pred_class})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)