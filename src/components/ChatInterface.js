import React, { useState, useRef, useEffect, memo } from 'react';
import './ChatInterface.css';

// Memoized message component for better performance
const Message = memo(({ message, onCopy }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message ${message.sender} ${message.isError ? 'error' : ''}`}>
      <div className="message-content">
        <div className="message-text">
          {message.text}
          {message.isStreaming && (
            <span className="typing-cursor">|</span>
          )}
        </div>
        <div className="message-timestamp">
          {formatTimestamp(message.timestamp)}
          <button 
            className="copy-button" 
            onClick={() => onCopy(message.text)}
            title="Copy message"
          >
            📋
          </button>
        </div>
      </div>
    </div>
  );
});

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  isDarkMode 
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add smooth scrolling for streaming messages
  useEffect(() => {
    const streamingMessage = messages.find(msg => msg.isStreaming);
    if (streamingMessage) {
      // Smooth scroll to bottom when streaming
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      // Auto-scroll to bottom when recording starts
      scrollToBottom();
    }
  }, [isRecording]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard');
    });
  };

  return (
    <div className={`chat-interface ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>Welcome to Axess Intelligence</h3>
              <p>Ask anything the way you want - type or use voice!</p>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <Message 
                key={message.id} 
                message={message} 
                onCopy={copyToClipboard}
              />
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            {isRecording && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="recording-indicator">
                    <div className="recording-dot"></div>
                    <span style={{ marginLeft: '8px', color: '#ef4444' }}>
                      Listening... Speak now!
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-bar">
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="message-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use voice..."
            disabled={isLoading || isRecording}
            rows={1}
            style={{
              resize: 'none',
              minHeight: '20px',
              maxHeight: '100px'
            }}
          />
          <div className="input-buttons">
            <button
              type="button"
              className={`mic-button ${isRecording ? 'recording' : ''}`}
              onClick={handleMicClick}
              disabled={isLoading}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              {isRecording ? (
                <div className="recording-indicator">
                  <div className="recording-dot"></div>
                </div>
              ) : (
                '🎤'
              )}
            </button>
            <button
              type="submit"
              className={`send-button ${inputValue.trim() ? 'active' : ''}`}
              disabled={!inputValue.trim() || isLoading || isRecording}
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;

