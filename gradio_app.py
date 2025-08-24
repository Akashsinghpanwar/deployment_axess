import gradio as gr
import requests
import json
import time
from datetime import datetime
import os

# Configuration
API_URL = "http://localhost:5000/chat"  # Your Flask API endpoint
DEFAULT_SYSTEM_PROMPT = """You are Axess Intelligence, an AI assistant specialized in corrosion prevention and industrial solutions. 
You help users with technical questions about corrosion, industrial processes, and Axess Corrosion products.
Always be helpful, professional, and provide accurate technical information."""

class AxessIntelligenceChat:
    def __init__(self):
        self.conversation_history = []
        self.system_prompt = DEFAULT_SYSTEM_PROMPT
    
    def format_message(self, role, content):
        """Format a message for the API"""
        return {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
    
    def add_to_history(self, role, content):
        """Add message to conversation history"""
        self.conversation_history.append(self.format_message(role, content))
    
    def get_conversation_context(self):
        """Get formatted conversation context for API"""
        messages = [{"role": "system", "content": self.system_prompt}]
        for msg in self.conversation_history[-10:]:  # Keep last 10 messages for context
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        return messages
    
    def chat_with_ai(self, user_message, history):
        """Main chat function for Gradio"""
        if not user_message.strip():
            return history, ""
        
        # Add user message to history
        self.add_to_history("user", user_message)
        
        try:
            # Prepare request to your API
            payload = {
                "message": user_message,
                "conversation_history": self.get_conversation_context()
            }
            
            # Make API request
            response = requests.post(API_URL, json=payload, timeout=30)
            
            if response.status_code == 200:
                ai_response = response.json().get("response", "I apologize, but I couldn't process your request.")
            else:
                ai_response = f"Error: API returned status {response.status_code}"
                
        except requests.exceptions.RequestException as e:
            ai_response = f"Connection error: {str(e)}"
        except Exception as e:
            ai_response = f"Error: {str(e)}"
        
        # Add AI response to history
        self.add_to_history("assistant", ai_response)
        
        # Update Gradio history
        history.append([user_message, ai_response])
        
        return history, ""
    
    def clear_chat(self):
        """Clear conversation history"""
        self.conversation_history = []
        return []
    
    def update_system_prompt(self, new_prompt):
        """Update the system prompt"""
        self.system_prompt = new_prompt if new_prompt.strip() else DEFAULT_SYSTEM_PROMPT
        return f"System prompt updated: {self.system_prompt[:50]}..."

def create_gradio_interface():
    """Create the Gradio interface"""
    chat_bot = AxessIntelligenceChat()
    
    # Custom CSS for better styling
    custom_css = """
    .gradio-container {
        max-width: 1200px !important;
        margin: 0 auto !important;
    }
    .chat-container {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 20px;
        padding: 20px;
        margin: 20px 0;
    }
    .message-user {
        background: rgba(124, 58, 237, 0.2);
        border: 1px solid rgba(124, 58, 237, 0.4);
        border-radius: 15px;
        padding: 15px;
        margin: 10px 0;
    }
    .message-bot {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        padding: 15px;
        margin: 10px 0;
    }
    """
    
    with gr.Blocks(css=custom_css, title="Axess Intelligence - Device Testing") as interface:
        gr.HTML("""
        <div style="text-align: center; margin: 20px 0;">
            <h1 style="color: #ffffff; font-size: 2.5rem; margin: 0; text-shadow: 0 0 20px rgba(124, 58, 237, 0.6);">
                🌟 AXESS INTELLIGENCE 🌟
            </h1>
            <p style="color: #cccccc; font-size: 1.1rem; margin: 10px 0;">
                Advanced AI Assistant for Corrosion Prevention & Industrial Solutions
            </p>
            <p style="color: #888888; font-size: 0.9rem; margin: 5px 0;">
                Test Interface for Multi-Device Compatibility
            </p>
        </div>
        """)
        
        with gr.Row():
            with gr.Column(scale=3):
                # Main chat interface
                chatbot = gr.Chatbot(
                    label="Axess Intelligence Chat",
                    height=500,
                    show_label=True,
                    container=True,
                    bubble_full_width=False
                )
                
                with gr.Row():
                    msg = gr.Textbox(
                        label="Your Message",
                        placeholder="Ask me anything about corrosion prevention, industrial processes, or Axess products...",
                        lines=2,
                        scale=4
                    )
                    send_btn = gr.Button("🚀 Send", variant="primary", scale=1)
                
                with gr.Row():
                    clear_btn = gr.Button("🗑️ Clear Chat", variant="secondary")
                    test_btn = gr.Button("🧪 Test Response", variant="secondary")
            
            with gr.Column(scale=1):
                # Control panel
                gr.HTML("""
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 20px; margin: 10px 0;">
                    <h3 style="color: #ffffff; margin: 0 0 15px 0;">⚙️ Controls</h3>
                </div>
                """)
                
                system_prompt = gr.Textbox(
                    label="System Prompt",
                    value=DEFAULT_SYSTEM_PROMPT,
                    lines=4,
                    placeholder="Customize the AI's behavior..."
                )
                
                update_prompt_btn = gr.Button("🔄 Update Prompt", variant="secondary")
                prompt_status = gr.Textbox(label="Status", interactive=False)
                
                gr.HTML("""
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 20px; margin: 20px 0;">
                    <h4 style="color: #ffffff; margin: 0 0 10px 0;">📱 Device Testing</h4>
                    <p style="color: #cccccc; font-size: 0.9rem; margin: 5px 0;">
                        • Test on mobile devices<br>
                        • Check responsive design<br>
                        • Verify chat functionality<br>
                        • Test different screen sizes
                    </p>
                </div>
                """)
                
                gr.HTML("""
                <div style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 15px; padding: 15px; margin: 10px 0;">
                    <h4 style="color: #ffffff; margin: 0 0 10px 0;">🔗 Access URL</h4>
                    <p style="color: #cccccc; font-size: 0.9rem; margin: 5px 0;">
                        Share this URL to test on different devices:
                    </p>
                    <code style="background: rgba(0, 0, 0, 0.3); padding: 5px; border-radius: 5px; color: #00ff00;">
                        [Your Server IP]:7860
                    </code>
                </div>
                """)
        
        # Event handlers
        def test_response():
            """Test function to simulate AI response"""
            test_message = "This is a test response from Axess Intelligence. The chat interface is working correctly!"
            return [[None, test_message]]
        
        # Connect components
        send_btn.click(
            chat_bot.chat_with_ai,
            inputs=[msg, chatbot],
            outputs=[chatbot, msg]
        )
        
        msg.submit(
            chat_bot.chat_with_ai,
            inputs=[msg, chatbot],
            outputs=[chatbot, msg]
        )
        
        clear_btn.click(
            chat_bot.clear_chat,
            outputs=[chatbot]
        )
        
        test_btn.click(
            test_response,
            outputs=[chatbot]
        )
        
        update_prompt_btn.click(
            chat_bot.update_system_prompt,
            inputs=[system_prompt],
            outputs=[prompt_status]
        )
    
    return interface

if __name__ == "__main__":
    # Create and launch the interface
    interface = create_gradio_interface()
    
    print("🚀 Starting Axess Intelligence Gradio App...")
    print("📱 Access URL for device testing:")
    print("   Local: http://localhost:7860")
    print("   Network: http://[YOUR_IP]:7860")
    print("")
    print("💡 Tips for device testing:")
    print("   • Use your phone's browser to access the network URL")
    print("   • Test on tablets and different screen sizes")
    print("   • Check responsive design and touch interactions")
    print("   • Verify chat functionality across devices")
    print("")
    
    # Launch with public access for device testing
    interface.launch(
        server_name="0.0.0.0",  # Allow external connections
        server_port=7860,
        share=True,  # Create public URL
        show_error=True,
        quiet=False
    )
