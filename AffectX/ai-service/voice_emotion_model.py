import numpy as np
import librosa
from sklearn.preprocessing import StandardScaler

class VoiceEmotionModel:
    def __init__(self):
        self.emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted']
        self.sample_rate = 22050
        self.scaler = StandardScaler()
        
    def extract_features(self, audio_path):
        """Extract MFCC features from audio"""
        try:
            y, sr = librosa.load(audio_path, sr=self.sample_rate)
            
            # Extract MFCC features
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            mfcc_mean = np.mean(mfcc, axis=1)
            
            # Extract zero crossing rate
            zcr = librosa.feature.zero_crossing_rate(y)[0]
            zcr_mean = np.mean(zcr)
            
            # Extract spectral centroid
            spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spec_centroid_mean = np.mean(spec_centroid)
            
            # Extract energy (root mean square)
            energy = np.sqrt(np.mean(y**2))
            
            # Combine features
            features = np.concatenate([mfcc_mean, [zcr_mean, spec_centroid_mean, energy]])
            
            return features
        except Exception as e:
            print(f"Error extracting features: {e}")
            return None
    
    def predict_emotion(self, audio_path):
        """Predict emotion from audio file using acoustic features"""
        try:
            y, sr = librosa.load(audio_path, sr=self.sample_rate)

            # Extract MFCC features
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            mfcc_mean = np.mean(mfcc, axis=1)
            mfcc_std = np.std(mfcc, axis=1)

            # Extract zero crossing rate (indicates noise/friction)
            zcr = librosa.feature.zero_crossing_rate(y)[0]
            zcr_mean = np.mean(zcr)
            zcr_std = np.std(zcr)

            # Extract spectral centroid (brightness of sound)
            spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spec_centroid_mean = np.mean(spec_centroid)
            spec_centroid_std = np.std(spec_centroid)

            # Extract spectral roll-off
            spec_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            spec_rolloff_mean = np.mean(spec_rolloff)

            # Extract energy (RMS)
            energy = np.sqrt(np.mean(y**2))

            # Extract tempo/beat
            onsets = librosa.onset.onset_strength(y=y, sr=sr)
            tempo_mean = np.mean(onsets)
            tempo_std = np.std(onsets)

            # Extract pitch (chroma features for melodic content)
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            chroma_mean = np.mean(chroma, axis=1)

            # Normalize all features
            all_features = np.concatenate([
                mfcc_mean, mfcc_std,
                [zcr_mean, zcr_std, spec_centroid_mean, spec_centroid_std,
                 spec_rolloff_mean, energy, tempo_mean, tempo_std],
                chroma_mean
            ])

            # Detect emotion based on comprehensive acoustic analysis
            emotion, confidence = self._classify_emotion(
                energy, zcr_mean, spec_centroid_mean, spec_rolloff_mean,
                mfcc_std, tempo_std, tempo_mean, chroma_mean
            )

            return emotion, float(confidence)
        except Exception as e:
            print(f"Error predicting emotion: {e}")
            return 'neutral', 0.5

    def _classify_emotion(self, energy, zcr, spec_centroid, spec_rolloff, mfcc_std, tempo_std, tempo_mean, chroma):
        """Classify emotion based on acoustic features"""
        # Normalize features to 0-1 range for better comparison
        energy_norm = min(1.0, energy / 0.1)  # Normalize energy
        brightness = min(1.0, spec_centroid / 8000) if spec_centroid > 0 else 0.5
        mfcc_variance = min(1.0, np.mean(mfcc_std) / 10)
        zcr_norm = min(1.0, zcr * 100)
        rhythm_strength = min(1.0, tempo_mean / 10)
        tempo_stability = 1.0 - min(1.0, tempo_std / 10)  # Low std = high stability
        spectral_flatness = min(1.0, (spec_rolloff - spec_centroid) / 8000)

        # Calculate emotion scores with better differentiation
        scores = {
            'happy': self._happy_score(energy_norm, brightness, rhythm_strength, tempo_stability, mfcc_variance),
            'sad': self._sad_score(energy_norm, brightness, mfcc_variance),
            'angry': self._angry_score(energy_norm, zcr_norm, tempo_stability, spectral_flatness),
            'surprised': self._surprised_score(energy_norm, brightness, mfcc_variance, tempo_stability),
            'fearful': self._fearful_score(zcr_norm, tempo_stability, spectral_flatness),
            'disgusted': self._disgusted_score(energy_norm, zcr_norm, brightness),
            'neutral': self._neutral_score(energy_norm, mfcc_variance, tempo_stability)
        }

        # Find emotion with highest score
        emotion = max(scores, key=scores.get)
        confidence = min(0.95, max(0.5, scores[emotion]))

        return emotion, confidence

    def _happy_score(self, energy, brightness, rhythm, stability, variance):
        """Score for happy emotion: high energy, bright, rhythmic, stable rhythm, controlled variance"""
        # Happy has controlled, pleasant voice with good rhythm and brightness
        return (energy * 0.35 + brightness * 0.35 + rhythm * 0.15 + stability * 0.1 + (1 - variance * 0.2)) * 1.3

    def _sad_score(self, energy, brightness, variance):
        """Score for sad emotion: low energy, dark, low variance, monotone"""
        # Sad is characterized by low energy and dark tone
        return ((1 - energy) * 0.5 + (1 - brightness) * 0.35 + (1 - variance) * 0.15) * 1.2

    def _angry_score(self, energy, zcr, stability, spectral_flatness):
        """Score for angry emotion: high energy, harsh/noisy, unstable rhythm, flat spectrum"""
        # Angry has aggressive, harsh qualities with poor rhythm control
        return (energy * 0.35 + zcr * 0.35 + (1 - stability) * 0.15 + spectral_flatness * 0.15) * 1.4

    def _surprised_score(self, energy, brightness, variance, stability):
        """Score for surprised emotion: moderate-high energy, bright, high variance, variable rhythm"""
        # Surprised has sudden changes and bright tone
        return (energy * 0.3 + brightness * 0.3 + variance * 0.25 + (1 - stability) * 0.15) * 1.1

    def _fearful_score(self, zcr, stability, spectral_flatness):
        """Score for fearful emotion: high frequency noise, unstable, erratic"""
        # Fearful has nervous, shaky qualities
        return (zcr * 0.4 + (1 - stability) * 0.3 + spectral_flatness * 0.3) * 1.0

    def _disgusted_score(self, energy, zcr, brightness):
        """Score for disgusted emotion: nasal/noisy (high ZCR), dark tone, lower energy"""
        # Disgusted has nasal quality and dark tone
        return (zcr * 0.4 + (1 - brightness) * 0.35 + (1 - energy) * 0.25) * 0.95

    def _neutral_score(self, energy, variance, stability):
        """Score for neutral emotion: moderate energy, low variance, stable"""
        # Neutral is flat and controlled
        return ((1 - abs(energy - 0.5) * 0.5) * 0.4 + (1 - variance) * 0.35 + stability * 0.25) * 1.0
