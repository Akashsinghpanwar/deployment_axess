#!/usr/bin/env python3
"""
Setup script for Axess Intelligence Gradio App
This script installs required dependencies and provides setup instructions.
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("📦 Installing Gradio dependencies...")
    
    try:
        # Install Gradio and other requirements
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements_gradio.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required!")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def create_startup_scripts():
    """Create startup scripts for easy launching"""
    
    # Windows batch file
    with open("start_gradio.bat", "w") as f:
        f.write("""@echo off
echo 🚀 Starting Axess Intelligence Gradio App...
echo.
echo 📱 This will create a public URL for device testing
echo.
python gradio_app.py
pause
""")
    
    # Linux/Mac shell script
    with open("start_gradio.sh", "w") as f:
        f.write("""#!/bin/bash
echo "🚀 Starting Axess Intelligence Gradio App..."
echo ""
echo "📱 This will create a public URL for device testing"
echo ""
python3 gradio_app.py
""")
    
    # Make shell script executable on Unix systems
    if os.name != 'nt':  # Not Windows
        os.chmod("start_gradio.sh", 0o755)
    
    print("✅ Startup scripts created!")

def main():
    """Main setup function"""
    print("🌟 Axess Intelligence Gradio App Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Install dependencies
    if not install_requirements():
        return
    
    # Create startup scripts
    create_startup_scripts()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the Flask API: python flask_api_simple.py")
    print("2. Start the Gradio app: python gradio_app.py")
    print("3. Or use the startup scripts:")
    print("   - Windows: start_gradio.bat")
    print("   - Linux/Mac: ./start_gradio.sh")
    print("\n📱 Device Testing:")
    print("• The Gradio app will provide a public URL")
    print("• Share this URL to test on different devices")
    print("• Test on phones, tablets, and different screen sizes")
    print("\n🔧 Configuration:")
    print("• Edit gradio_app.py to customize the interface")
    print("• Modify flask_api_simple.py to connect your AI model")
    print("• Update the system prompt in the Gradio interface")

if __name__ == "__main__":
    main()
