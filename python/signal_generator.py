"""
Signal Generator Module
Simulates biosignals like heart rate (PPG) and respiration
"""
import numpy as np

class BiosignalGenerator:
    """Generates simulated vital sign signals with realistic noise"""
    
    def __init__(self, sample_rate=1000):
        self.sample_rate = sample_rate
    
    def generate_ppg_signal(self, duration, heart_rate_bpm=72, noise_level=0.3):
        """
        Generate simulated Photoplethysmogram (PPG) signal
        Used in pulse oximeters and heart rate monitors
        
        Args:
            duration: Signal duration in seconds
            heart_rate_bpm: Heart rate in beats per minute
            noise_level: Amount of random noise (0-1)
        
        Returns:
            t: Time array
            signal: PPG signal with noise
            clean_signal: Clean PPG signal without noise
        """
        t = np.linspace(0, duration, int(self.sample_rate * duration))
        heart_rate_hz = heart_rate_bpm / 60.0
        
        # PPG signal is modeled as sum of harmonics
        clean_signal = (
            np.sin(2 * np.pi * heart_rate_hz * t) +
            0.5 * np.sin(2 * np.pi * 2 * heart_rate_hz * t) +
            0.25 * np.sin(2 * np.pi * 3 * heart_rate_hz * t)
        )
        
        # Add realistic noise
        noise = noise_level * np.random.randn(len(t))
        baseline_drift = 0.2 * np.sin(2 * np.pi * 0.1 * t)  # Slow baseline wander
        
        noisy_signal = clean_signal + noise + baseline_drift
        
        return t, noisy_signal, clean_signal
    
    def generate_respiration_signal(self, duration, breath_rate=15, noise_level=0.2):
        """
        Generate simulated respiration signal
        
        Args:
            duration: Signal duration in seconds
            breath_rate: Breaths per minute
            noise_level: Amount of random noise
        
        Returns:
            t: Time array
            signal: Respiration signal with noise
        """
        t = np.linspace(0, duration, int(self.sample_rate * duration))
        breath_rate_hz = breath_rate / 60.0
        
        # Respiration is roughly sinusoidal
        clean_signal = np.sin(2 * np.pi * breath_rate_hz * t)
        noise = noise_level * np.random.randn(len(t))
        
        return t, clean_signal + noise, clean_signal
    
    def generate_ecg_signal(self, duration, heart_rate_bpm=72, noise_level=0.1):
        """
        Generate simplified ECG-like signal with QRS complex
        
        Args:
            duration: Signal duration in seconds
            heart_rate_bpm: Heart rate in beats per minute
            noise_level: Amount of random noise
        
        Returns:
            t: Time array
            signal: ECG signal with noise
        """
        t = np.linspace(0, duration, int(self.sample_rate * duration))
        period = 60.0 / heart_rate_bpm
        
        signal = np.zeros(len(t))
        
        # Generate QRS-like peaks at regular intervals
        for i, time in enumerate(t):
            phase = (time % period) / period
            
            # P wave
            if 0.1 < phase < 0.2:
                signal[i] = 0.25 * np.sin((phase - 0.1) * 10 * np.pi)
            # QRS complex
            elif 0.35 < phase < 0.45:
                local_phase = (phase - 0.35) * 10
                if local_phase < 0.3:
                    signal[i] = -0.2 * local_phase / 0.3
                elif local_phase < 0.5:
                    signal[i] = -0.2 + 1.2 * (local_phase - 0.3) / 0.2
                elif local_phase < 0.7:
                    signal[i] = 1.0 - 1.3 * (local_phase - 0.5) / 0.2
                else:
                    signal[i] = -0.3 + 0.3 * (local_phase - 0.7) / 0.3
            # T wave
            elif 0.55 < phase < 0.7:
                signal[i] = 0.35 * np.sin((phase - 0.55) * 6.67 * np.pi)
        
        # Add noise
        noise = noise_level * np.random.randn(len(t))
        powerline_noise = 0.05 * np.sin(2 * np.pi * 50 * t)  # 50Hz interference
        
        return t, signal + noise + powerline_noise, signal


if __name__ == "__main__":
    # Demo
    gen = BiosignalGenerator(sample_rate=500)
    t, noisy, clean = gen.generate_ppg_signal(5, heart_rate_bpm=75)
    print(f"Generated {len(t)} samples of PPG signal")
    print(f"Signal range: {noisy.min():.2f} to {noisy.max():.2f}")
