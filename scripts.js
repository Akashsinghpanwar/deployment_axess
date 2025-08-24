// Axess Intelligence System - Main Application
class AxessChat {
    constructor() {
        this.messages = [];
        this.isRecording = false;
        this.isStreaming = false;
        this.recognition = null;
        this.streamingMessage = null;
        this.llamaCloudConfig = {
            organizationId: '390a9fe2-4fca-4e2f-89ab-ff5ef3fdfb92', // Replace with your actual org ID
            apiKey: 'llx-9ykKVECu47kb09Ve1wKRWtUjyUgCgTFQstemXc5POiZpgBrS', // Replace with your actual API key
            pipelineId: '35c8566b-fbc2-466f-aef5-5ce4f3ee9fe0',
            baseUrl: 'https://api.cloud.llamaindex.ai/api/v1'
        };
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.initStarfield();
        this.initSpeechRecognition();
        this.loadChatHistory();
        this.showWelcomeMessage();
        this.startFloatingProducts();
    }

    setupElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.micButton = document.getElementById('micButton');
        this.clearChatButton = document.getElementById('clearChat');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorToast = document.getElementById('errorToast');
        this.errorMessage = document.getElementById('errorMessage');
        this.starfield = document.getElementById('starfield');
    }

    setupEventListeners() {
        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Mic button events
        this.micButton.addEventListener('mousedown', () => this.startRecording());
        this.micButton.addEventListener('mouseup', () => this.stopRecording());
        this.micButton.addEventListener('mouseleave', () => this.stopRecording());
        
        // Touch events for mobile
        this.micButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startRecording();
        });
        this.micButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopRecording();
        });

        // Clear chat
        this.clearChatButton.addEventListener('click', () => this.clearChat());

        // Error toast close
        document.querySelector('.toast-close').addEventListener('click', () => {
            this.hideErrorToast();
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());

        // Parallax effect
        document.addEventListener('mousemove', (e) => this.handleParallax(e));


    }

    // Starfield and Parallax Effects
    initStarfield() {
        // Create additional stars dynamically
        this.createStars();
        
        // Start parallax effect
        this.startParallax();
    }

    createStars() {
        const layers = document.querySelectorAll('.stars');
        layers.forEach((layer, index) => {
            const starCount = 50 + (index * 30);
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.cssText = `
                    position: absolute;
                    width: ${1 + Math.random() * 2}px;
                    height: ${1 + Math.random() * 2}px;
                    background: rgba(255, 255, 255, ${0.3 + Math.random() * 0.7});
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: twinkle ${3 + Math.random() * 5}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 5}s;
                `;
                layer.appendChild(star);
            }
        });
    }

    startParallax() {
        let ticking = false;
        
        const updateParallax = (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleParallax(e);
                    ticking = false;
                });
                ticking = true;
            }
        };

        document.addEventListener('mousemove', updateParallax);
    }

    handleParallax(e) {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const x = (clientX - innerWidth / 2) / innerWidth;
        const y = (clientY - innerHeight / 2) / innerHeight;
        
        const layers = document.querySelectorAll('.stars');
        layers.forEach((layer, index) => {
            const speed = (index + 1) * 0.5;
            const translateX = x * speed * 50;
            const translateY = y * speed * 50;
            
            layer.style.transform = `translate(${translateX}px, ${translateY}px)`;
        });
    }

    // Floating Product Animations
    startFloatingProducts() {
        const products = document.querySelectorAll('.product-item');
        
        products.forEach((product, index) => {
            // Reset animation after completion
            product.addEventListener('animationend', () => {
                setTimeout(() => {
                    product.style.animation = 'none';
                    product.offsetHeight; // Trigger reflow
                    product.style.animation = `float-in 8s ease-out forwards`;
                    product.style.animationDelay = `${Math.random() * 4}s`;
                }, 2000);
            });
        });
    }

    // Speech Recognition
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                this.autoResizeTextarea();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showError('Speech recognition failed. Please try typing instead.');
            };
        } else {
            this.micButton.style.display = 'none';
        }
    }

    startRecording() {
        if (!this.recognition) return;
        
        this.isRecording = true;
        this.micButton.classList.add('recording');
        this.recognition.start();
        
        // Haptic feedback on mobile
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }

    stopRecording() {
        if (!this.recognition) return;
        
        this.isRecording = false;
        this.micButton.classList.remove('recording');
        this.recognition.stop();
    }

    // Chat Functionality
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isStreaming) return;

        // Add user message
        this.addMessage('user', message);
        this.messageInput.value = '';
        this.autoResizeTextarea();
        
        // Show loading state
        this.sendButton.classList.add('sending');
        
        try {
            await this.processWithLlamaCloud(message);
        } catch (error) {
            console.error('Error processing message:', error);
            this.showError('Failed to get response. Please try again.');
        } finally {
            this.sendButton.classList.remove('sending');
        }
    }

    async processWithLlamaCloud(message) {
        this.isStreaming = true;
        
        // Add assistant message placeholder
        const assistantMessage = this.addMessage('assistant', '');
        this.streamingMessage = assistantMessage;
        
        try {
                    // Call our Flask API endpoint which handles LlamaCloud integration
        const response = await fetch('http://localhost:5000/api/axess/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            // Stream the response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let metaData = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                
                // Check for meta data at the end
                const metaMatch = buffer.match(/\n\[\[META\]\](.+)$/);
                if (metaMatch) {
                    try {
                        metaData = JSON.parse(metaMatch[1]);
                        buffer = buffer.replace(/\n\[\[META\]\].+$/, '');
                    } catch (e) {
                        console.error('Failed to parse meta data:', e);
                    }
                }

                // Update the message content
                this.updateMessageContent(assistantMessage, buffer + '▋');
            }

            // Remove cursor and add final content
            this.updateMessageContent(assistantMessage, buffer);

            // Add source chips if available
            if (metaData && metaData.citations && metaData.citations.length > 0) {
                this.addSourceChips(assistantMessage, metaData.citations);
            }

        } catch (error) {
            console.error('API error:', error);
            this.updateMessageContent(assistantMessage, 'Sorry, I encountered an error while processing your request. Please try again.');
            throw error;
        } finally {
            this.isStreaming = false;
            this.streamingMessage = null;
        }
    }

    addSourceChips(messageElement, citations) {
        const sourceChips = document.createElement('div');
        sourceChips.className = 'source-chips';
        
        citations.forEach(citation => {
            const chip = document.createElement('div');
            chip.className = 'source-chip';
            chip.textContent = new URL(citation).hostname;
            chip.title = citation;
            chip.onclick = () => window.open(citation, '_blank');
            sourceChips.appendChild(chip);
        });
        
        messageElement.appendChild(sourceChips);
    }

    async streamResponse(response, messageElement) {
        const words = response.split(' ');
        let currentText = '';
        
        for (let i = 0; i < words.length; i++) {
            if (!this.isStreaming) break;
            
            currentText += (i > 0 ? ' ' : '') + words[i];
            this.updateMessageContent(messageElement, currentText + '▋');
            
            // Random delay for natural typing effect
            await this.delay(50 + Math.random() * 100);
        }
        
        // Remove cursor
        this.updateMessageContent(messageElement, currentText);
    }

    addMessage(role, content) {
        const message = {
            id: Date.now(),
            role,
            content,
            timestamp: new Date().toISOString()
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.saveChatHistory();
        this.scrollToBottom();
        
        return message;
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;
        messageDiv.dataset.messageId = message.id;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.formatMessageContent(message.content);
        
        messageDiv.appendChild(contentDiv);
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = this.formatTimestamp(message.timestamp);
        messageDiv.appendChild(timestamp);
        
        // Add actions for assistant messages
        if (message.role === 'assistant') {
            const actions = document.createElement('div');
            actions.className = 'message-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy message';
            copyBtn.onclick = () => this.copyMessage(message.content);
            
            actions.appendChild(copyBtn);
            messageDiv.appendChild(actions);
        }
        
        this.chatMessages.appendChild(messageDiv);
    }

    updateMessageContent(messageElement, content) {
        const contentDiv = messageElement.querySelector('.message-content');
        if (contentDiv) {
            contentDiv.innerHTML = this.formatMessageContent(content);
        }
    }

    formatMessageContent(content) {
        // Basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    copyMessage(content) {
        navigator.clipboard.writeText(content).then(() => {
            this.showToast('Message copied to clipboard!', 'success');
        }).catch(() => {
            this.showError('Failed to copy message');
        });
    }

    // Utility Functions
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showWelcomeMessage() {
        if (this.messages.length === 0) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = `
                <h2>Hi, this is Axess Intelligence</h2>
                <p>Ask anything the way you want...</p>
            `;
            this.chatMessages.appendChild(welcomeDiv);
        }
    }

    sendExamplePrompt(prompt) {
        this.messageInput.value = prompt;
        this.autoResizeTextarea();
        this.sendMessage();
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.messages = [];
            this.chatMessages.innerHTML = '';
            this.saveChatHistory();
            this.showWelcomeMessage();
        }
    }

    // Error Handling
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorToast.classList.remove('hidden');
        this.errorToast.classList.add('show');
        
        setTimeout(() => {
            this.hideErrorToast();
        }, 5000);
    }

    hideErrorToast() {
        this.errorToast.classList.remove('show');
        this.errorToast.classList.add('hidden');
    }

    showToast(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(59, 130, 246, 0.95)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1002;
            transform: translateY(100px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Local Storage
    saveChatHistory() {
        try {
            localStorage.setItem('axess-chat-history', JSON.stringify(this.messages.slice(-20)));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('axess-chat-history');
            if (saved) {
                this.messages = JSON.parse(saved);
                this.messages.forEach(message => this.renderMessage(message));
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    // Loading States
    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }


}

// Initialize the application
let chat;

document.addEventListener('DOMContentLoaded', () => {
    chat = new AxessChat();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && chat && chat.isRecording) {
        chat.stopRecording();
    }
});

// Handle beforeunload
window.addEventListener('beforeunload', () => {
    if (chat) {
        chat.saveChatHistory();
    }
});

// Export for global access
window.chat = chat;

