
from flask import Flask, request, jsonify
from flask_cors import CORS
from voice_emotion_model import VoiceEmotionModel
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'])

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg', 'm4a', 'webm'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Load model
model = VoiceEmotionModel()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'AI Service is running'})

@app.route('/analyze-voice', methods=['POST'])
def analyze_voice():
    """Analyze voice emotion from uploaded audio file"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File format not allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Analyze emotion
        emotion, confidence = model.predict_emotion(filepath)
        
        # Clean up
        os.remove(filepath)
        
        return jsonify({
            'emotion': emotion,
            'confidence': confidence,
            'message': 'Voice analyzed successfully'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)