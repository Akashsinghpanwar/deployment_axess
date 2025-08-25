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
        const response = await fetch('http://127.0.0.1:8000/chat', {
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

    try {
      // Call local endpoint
      console.log('Sending message to backend:', message);
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: message }),
      });

      console.log('Backend response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend response data:', data);
        const assistantMessage = {
          id: Date.now() + 1,
          text: data.answer, // Only display the answer field
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('Backend error status:', response.status);
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToastMessage(`Connection error: ${error.message}. Please check if your backend is running on http://127.0.0.1:8000`);
    } finally {
      setIsLoading(false);
    }
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
      const response = await fetch('http://127.0.0.1:8000/chat', {
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
      </div>
    </div>
  );
}

export default App;