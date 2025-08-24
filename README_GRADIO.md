# 🌟 Axess Intelligence - Gradio Device Testing App

A Gradio-based web interface for testing the Axess Intelligence chat system across different devices and screen sizes.

## 🚀 Features

- **Multi-Device Testing**: Test the chat interface on phones, tablets, and desktops
- **Responsive Design**: Automatically adapts to different screen sizes
- **Public URL**: Share a public URL for easy access from any device
- **Real-time Chat**: Interactive chat interface with mock AI responses
- **Customizable**: Easy to modify system prompts and responses
- **Professional UI**: Beautiful, modern interface with Axess branding

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Internet connection (for public URL generation)

## 🛠️ Installation

### Option 1: Automatic Setup (Recommended)

```bash
python setup_gradio.py
```

This will:
- Install all required dependencies
- Create startup scripts
- Provide setup instructions

### Option 2: Manual Installation

1. **Install dependencies:**
```bash
pip install -r requirements_gradio.txt
```

2. **Verify installation:**
```bash
python -c "import gradio; print('Gradio installed successfully!')"
```

## 🚀 Running the App

### Step 1: Start the Flask API (Backend)

```bash
python flask_api_simple.py
```

**Expected output:**
```
🚀 Starting Axess Intelligence Flask API...
📡 API will be available at: http://localhost:5000
💬 Chat endpoint: http://localhost:5000/chat
🏥 Health check: http://localhost:5000/health
```

### Step 2: Start the Gradio App (Frontend)

```bash
python gradio_app.py
```

**Expected output:**
```
🚀 Starting Axess Intelligence Gradio App...
📱 Access URL for device testing:
   Local: http://localhost:7860
   Network: http://[YOUR_IP]:7860

💡 Tips for device testing:
   • Use your phone's browser to access the network URL
   • Test on tablets and different screen sizes
   • Check responsive design and touch interactions
   • Verify chat functionality across devices

Running on local URL:  http://127.0.0.1:7860
Running on public URL: https://xxxxx.gradio.live
```

### Alternative: Use Startup Scripts

**Windows:**
```bash
start_gradio.bat
```

**Linux/Mac:**
```bash
./start_gradio.sh
```

## 📱 Device Testing Guide

### 1. **Local Testing**
- Open `http://localhost:7860` in your browser
- Test different window sizes
- Check responsive behavior

### 2. **Mobile Testing**
- Use the **public URL** provided by Gradio
- Share this URL with your phone/tablet
- Test touch interactions and scrolling

### 3. **Network Testing**
- Use your computer's IP address: `http://[YOUR_IP]:7860`
- Ensure devices are on the same network
- Test from different devices on the network

### 4. **Cross-Device Testing**
- Test on different browsers (Chrome, Safari, Firefox)
- Test on different operating systems (iOS, Android, Windows, Mac)
- Test on different screen sizes (phone, tablet, desktop)

## 🎯 Testing Checklist

### ✅ **Responsive Design**
- [ ] Interface adapts to mobile screens
- [ ] Text is readable on small screens
- [ ] Buttons are touch-friendly
- [ ] Chat bubbles resize properly

### ✅ **Functionality**
- [ ] Messages send and receive correctly
- [ ] Chat history is maintained
- [ ] Clear chat button works
- [ ] Test response button works

### ✅ **Performance**
- [ ] App loads quickly on mobile
- [ ] Responses appear in reasonable time
- [ ] No lag during typing
- [ ] Smooth scrolling

### ✅ **User Experience**
- [ ] Interface is intuitive
- [ ] Error messages are clear
- [ ] Loading states are visible
- [ ] Professional appearance

## 🔧 Configuration

### Customizing the Interface

Edit `gradio_app.py` to modify:
- **Appearance**: Colors, fonts, layout
- **Functionality**: Chat behavior, response handling
- **Branding**: Axess logo, company information

### Connecting Real AI Model

Replace the mock API in `flask_api_simple.py` with:
- Your actual AI model API
- OpenAI, Anthropic, or other AI services
- Custom AI implementation

### System Prompt

Modify the system prompt in the Gradio interface to:
- Change AI personality
- Add specific instructions
- Include company information

## 📁 File Structure

```
axess-corrosion-chat/
├── gradio_app.py              # Main Gradio application
├── flask_api_simple.py        # Mock API for testing
├── setup_gradio.py            # Setup script
├── requirements_gradio.txt    # Python dependencies
├── start_gradio.bat          # Windows startup script
├── start_gradio.sh           # Linux/Mac startup script
└── README_GRADIO.md          # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change port in gradio_app.py
   interface.launch(server_port=7861)
   ```

2. **API connection error:**
   - Ensure Flask API is running on port 5000
   - Check firewall settings
   - Verify network connectivity

3. **Dependencies not found:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements_gradio.txt
   ```

4. **Public URL not working:**
   - Check internet connection
   - Try using local IP address instead
   - Verify Gradio share feature is enabled

### Getting Help

- Check the console output for error messages
- Verify all dependencies are installed
- Ensure both Flask API and Gradio app are running
- Test with different browsers and devices

## 🎉 Success!

Once everything is working:
- ✅ Share the public URL with your team
- ✅ Test on various devices and screen sizes
- ✅ Collect feedback on user experience
- ✅ Iterate and improve the interface

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the console output for error messages
- Test with different configurations
- Consider updating dependencies

---

**Happy Testing! 🚀📱✨**
