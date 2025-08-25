import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Starfield from './components/Starfield';
import FloatingProducts from './components/FloatingProducts';
import ThemeToggle from './components/ThemeToggle';
import Logo from './components/Logo';
import ChatInterface from './components/ChatInterface';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  const recognitionRef = useRef(null);

  // Test backend connection on app load
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        console.log('Testing backend connection...');
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: 'test connection' }),
        });
        
        if (response.ok) {
          console.log('Backend is connected!');
          setBackendStatus('connected');
          showToastMessage('Backend connected successfully!');
        } else {
          console.log('Backend responded but with error status:', response.status);
          setBackendStatus('error');
          showToastMessage('Backend responded with error. Check your backend logs.');
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
        setBackendStatus('disconnected');
        showToastMessage('Cannot connect to backend. Make sure it\'s running on http://127.0.0.1:8000');
      }
    };

    testBackendConnection();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create a placeholder for the streaming response
    const streamingMessageId = Date.now() + 1;
    const streamingMessage = {
      id: streamingMessageId,
      text: '',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true
    };

    setMessages(prev => [...prev, streamingMessage]);

    try {
      console.log('Sending message to backend:', message);
      console.log('Backend URL:', '/chat');
      
      const requestBody = JSON.stringify({ query: message });
      console.log('Request body:', requestBody);
      
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: requestBody,
        mode: 'cors',
      });

      console.log('Backend response status:', response.status);
      
      if (response.ok) {
        // Check if response supports streaming
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/event-stream')) {
          // Handle Server-Sent Events streaming
          await handleStreamingResponse(response, streamingMessageId);
        } else {
          // Handle regular JSON response with simulated streaming
          const data = await response.json();
          console.log('Backend response data:', data);
          await simulateStreamingResponse(data.answer, streamingMessageId);
        }
      } else {
        console.error('Backend error status:', response.status);
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Connection error. ';
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage += 'Cannot connect to backend. Please check if your backend is running on http://127.0.0.1:8000';
      } else if (error.name === 'TypeError' && error.message.includes('CORS')) {
        errorMessage += 'CORS error. Your backend needs to allow requests from http://localhost:3000';
      } else {
        errorMessage += error.message;
      }
      
      showToastMessage(errorMessage);
      
      // Remove the streaming message on error
      setMessages(prev => prev.filter(msg => msg.id !== streamingMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Server-Sent Events streaming
  const handleStreamingResponse = async (response, messageId) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Streaming complete
              setMessages(prev => prev.map(msg => 
                msg.id === messageId 
                  ? { ...msg, isStreaming: false }
                  : msg
              ));
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, text: msg.text + parsed.chunk }
                    : msg
                ));
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading stream:', error);
    }
  };

  // Simulate streaming for regular JSON responses
  const simulateStreamingResponse = async (fullText, messageId) => {
    // Split text into natural chunks for smoother streaming
    const chunks = fullText.split(/([.!?]\s+|\s+)/);
    let currentText = '';

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk) continue;

      currentText += chunk;
      
      // Update the message with current text
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: currentText }
          : msg
      ));

      // Calculate delay based on chunk type and length
      let delay;
      if (chunk.match(/[.!?]\s*$/)) {
        // Longer pause for sentence endings
        delay = 150 + Math.random() * 100;
      } else if (chunk.match(/^\s+$/)) {
        // Very short delay for whitespace
        delay = 5;
      } else if (chunk.length > 10) {
        // Medium delay for longer words/phrases
        delay = 40 + Math.random() * 30;
      } else {
        // Standard delay for regular words
        delay = 20 + Math.random() * 25;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Mark streaming as complete
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isStreaming: false }
        : msg
    ));
  };

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        showToastMessage('Recording started... Speak now!');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice transcript:', transcript);
        sendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        let errorMessage = 'Voice recognition failed. Please try typing instead.';
        if (event.error === 'no-speech') {
          errorMessage = 'No speech detected. Please try speaking again.';
        } else if (event.error === 'audio-capture') {
          errorMessage = 'Microphone not found. Please check your microphone.';
        } else if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access denied. Please allow microphone access.';
        }
        
        showToastMessage(errorMessage);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        showToastMessage('Error starting voice recognition. Please try again.');
      }
    } else {
      showToastMessage('Voice recognition not supported in this browser.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsRecording(false);
    showToastMessage('Recording stopped.');
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'test connection' }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend test response:', data);
        setBackendStatus('connected');
        showToastMessage('Backend test successful!');
      } else {
        console.log('Backend responded but with error status:', response.status);
        setBackendStatus('error');
        showToastMessage('Backend test failed. Check your backend logs.');
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendStatus('disconnected');
      showToastMessage('Cannot connect to backend. Make sure it\'s running on http://127.0.0.1:8000');
    }
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Starfield Background */}
      <Starfield isDarkMode={isDarkMode} />

      {/* Floating Products */}
      <FloatingProducts isDarkMode={isDarkMode} />

      {/* Theme Toggle */}
      <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />

      {/* Page Layout with Grid */}
      <div className="page">
        {/* Header with Logo */}
        <header className="logo-bar">
          <Logo isDarkMode={isDarkMode} />
        </header>

        {/* Main Content */}
        <main className="main">
          <ChatInterface
            messages={messages}
            onSendMessage={sendMessage}
            isLoading={isLoading}
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            isDarkMode={isDarkMode}
          />
        </main>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`toast-notification ${isDarkMode ? 'dark' : 'light'}`}>
          {toastMessage}
        </div>
      )}

      {/* Backend Status Indicator */}
      <div className={`backend-status ${backendStatus} ${isDarkMode ? 'dark' : 'light'}`}>
        Backend: {backendStatus === 'connected' ? '🟢 Connected' : 
                  backendStatus === 'checking' ? '🟡 Checking...' : 
                  backendStatus === 'error' ? '🟠 Error' : '🔴 Disconnected'}
        <button 
          onClick={testBackendConnection}
          style={{
            marginLeft: '10px',
            padding: '4px 8px',
            fontSize: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            color: 'inherit',
            cursor: 'pointer'
          }}
        >
          Test
        </button>
      </div>
    </div>
  );
}

export default App;