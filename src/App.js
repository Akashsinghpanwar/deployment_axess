import { useRef, useState } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import FloatingProducts from './components/FloatingProducts';
import Logo from './components/Logo';
import Starfield from './components/Starfield';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const recognitionRef = useRef(null);

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
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: message }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = {
          id: Date.now() + 1,
          text: data.answer, // Only display the answer field
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToastMessage('Error sending message. Please try again.');
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

      recognition.onstart = () => {
        setIsRecording(true);
        showToastMessage('Recording started...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
      };

      recognition.onerror = (event) => {
        showToastMessage('Voice recognition error.');
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        showToastMessage('Recording stopped.');
      };

      recognition.start();
    } else {
      showToastMessage('Voice recognition not supported in this browser.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
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

