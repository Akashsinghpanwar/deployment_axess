import React, { useState, useEffect } from 'react';
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
  const [recognition, setRecognition] = useState(null);

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantMessage = {
        id: Date.now() + 1,
        text: `Thank you for your message: "${message}". This is a demo response from Axess Intelligence.`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      showToastMessage('Error sending message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    if (!recognition) {
      showToastMessage('Voice recognition not supported in this browser.');
      return;
    }

    try {
      recognition.start();
      setIsRecording(true);
      showToastMessage('Recording started... Speak now!');
    } catch (error) {
      console.error('Error starting recognition:', error);
      showToastMessage('Error starting voice recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
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

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      
      newRecognition.continuous = false;
      newRecognition.interimResults = false;
      newRecognition.lang = 'en-US';
      newRecognition.maxAlternatives = 1;

      newRecognition.onstart = () => {
        setIsRecording(true);
        showToastMessage('Recording... Speak now!');
      };

      newRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice transcript:', transcript);
        
        // Send the transcribed text as a message
        sendMessage(transcript);
      };

      newRecognition.onerror = (event) => {
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

      newRecognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(newRecognition);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }

    // Cleanup function
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (error) {
          console.error('Error stopping recognition during cleanup:', error);
        }
      }
    };
  }, []);

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
    </div>
  );
}

export default App;

