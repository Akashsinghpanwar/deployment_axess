import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isRecording, 
  onStartRecording, 
  onStopRecording,
  isDarkMode
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;
    
    onSendMessage(inputMessage.trim());
    setInputMessage('');
    setIsTyping(false);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  // Handle microphone button
  const handleMicClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  // Copy message to clipboard
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You can add a toast notification here
      console.log('Message copied to clipboard');
    });
  };

  return (
    <div className={`chat-interface ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Messages Container */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>Welcome to Axess Intelligence</h3>
              <p>Ask anything the way you want. I'm here to help with Axess products, services, and technical specifications.</p>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
              >
                <div className="message-content">
                  <div className="message-text">
                    {message.text}
                    {message.sender === 'assistant' && message.text && (
                      <button
                        className="copy-button"
                        onClick={() => copyMessage(message.text)}
                        aria-label="Copy message"
                      >
                        📋
                      </button>
                    )}
                  </div>
                  <div className="message-timestamp">
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="message assistant loading-message">
                <div className="message-content">
                  <div className="message-text">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="input-bar">
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="message-input"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading}
          />
          
          <div className="input-buttons">
            {/* Microphone Button */}
            <button
              className={`mic-button ${isRecording ? 'recording' : ''}`}
              onClick={handleMicClick}
              disabled={isLoading}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <div className="recording-indicator">
                  <div className="recording-dot"></div>
                </div>
              ) : (
                '🎤'
              )}
            </button>

            {/* Send Button */}
            <button
              className={`send-button ${isTyping ? 'active' : ''}`}
              onClick={handleSendMessage}
              disabled={!isTyping || isLoading}
              aria-label="Send message"
            >
              ✈️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

