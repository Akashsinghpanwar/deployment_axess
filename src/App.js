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
    setIsRecording(true);
    showToastMessage('Recording started...');
  };

  const stopRecording = () => {
    setIsRecording(false);
    showToastMessage('Recording stopped.');
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
    </div>
  );
}

export default App;

