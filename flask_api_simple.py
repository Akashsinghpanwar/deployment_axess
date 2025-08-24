from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Mock AI responses for testing
MOCK_RESPONSES = {
    "corrosion": "Corrosion prevention is crucial in industrial applications. Axess Corrosion offers advanced solutions including protective coatings, inhibitors, and monitoring systems to prevent metal degradation.",
    "products": "Axess Corrosion provides a comprehensive range of products including anti-corrosion coatings, rust inhibitors, protective films, and monitoring equipment for various industrial applications.",
    "industrial": "For industrial corrosion prevention, we recommend our advanced coating systems that provide long-term protection against harsh environmental conditions and chemical exposure.",
    "test": "This is a test response from Axess Intelligence. The API is working correctly!",
    "default": "Thank you for your inquiry. I'm Axess Intelligence, your AI assistant for corrosion prevention and industrial solutions. How can I help you today?"
}

def generate_ai_response(user_message, conversation_history=None):
    """Generate a mock AI response based on user input"""
    user_message_lower = user_message.lower()
    
    # Simple keyword-based responses for testing
    if "corrosion" in user_message_lower:
        return MOCK_RESPONSES["corrosion"]
    elif "product" in user_message_lower:
        return MOCK_RESPONSES["products"]
    elif "industrial" in user_message_lower:
        return MOCK_RESPONSES["industrial"]
    elif "test" in user_message_lower:
        return MOCK_RESPONSES["test"]
    else:
        return MOCK_RESPONSES["default"]

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        conversation_history = data.get('conversation_history', [])
        
        if not user_message.strip():
            return jsonify({
                'error': 'No message provided',
                'response': 'Please provide a message.'
            }), 400
        
        # Generate AI response
        ai_response = generate_ai_response(user_message, conversation_history)
        
        # Add some delay to simulate processing
        time.sleep(0.5)
        
        return jsonify({
            'response': ai_response,
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'response': 'An error occurred while processing your request.'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Axess Intelligence API',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Axess Intelligence API',
        'endpoints': {
            'chat': '/chat (POST)',
            'health': '/health (GET)'
        },
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting Axess Intelligence Flask API...")
    print("📡 API will be available at: http://localhost:5000")
    print("💬 Chat endpoint: http://localhost:5000/chat")
    print("🏥 Health check: http://localhost:5000/health")
    print("")
    print("💡 This API provides mock responses for testing the Gradio interface.")
    print("   Connect your actual AI model here for production use.")
    print("")
    
    app.run(
        host='0.0.0.0',  # Allow external connections
        port=5000,
        debug=True
    )
