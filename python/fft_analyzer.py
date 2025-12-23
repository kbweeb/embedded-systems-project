"""
FFT Analyzer Module
Frequency domain analysis for extracting vital signs from signals
"""
import numpy as np

class FFTAnalyzer:
    """Fast Fourier Transform analysis for biosignals"""
    
    def __init__(self, sample_rate=1000):
        self.sample_rate = sample_rate
    
    def compute_fft(self, signal_data):
        """
        Compute FFT of a signal
        
        Args:
            signal_data: Time-domain signal
        
        Returns:
            frequencies: Frequency bins
            magnitude: Magnitude spectrum
            phase: Phase spectrum
        """
        n = len(signal_data)
        
        # Apply window to reduce spectral leakage
        window = np.hanning(n)
        windowed_signal = signal_data * window
        
        # Compute FFT
        fft_result = np.fft.fft(windowed_signal)
        frequencies = np.fft.fftfreq(n, 1/self.sample_rate)
        
        # Get positive frequencies only
        positive_mask = frequencies >= 0
        frequencies = frequencies[positive_mask]
        fft_result = fft_result[positive_mask]
        
        magnitude = np.abs(fft_result) * 2 / n  # Normalize
        phase = np.angle(fft_result)
        
        return frequencies, magnitude, phase
    
    def compute_psd(self, signal_data, nperseg=256):
        """
        Compute Power Spectral Density using Welch's method
        More robust for noisy signals
        
        Args:
            signal_data: Time-domain signal
            nperseg: Samples per segment
        
        Returns:
            frequencies: Frequency bins
            psd: Power spectral density
        """
        from scipy import signal as sig
        frequencies, psd = sig.welch(signal_data, self.sample_rate, nperseg=nperseg)
        return frequencies, psd
    
    def find_dominant_frequency(self, signal_data, freq_range=(0.5, 4)):
        """
        Find the dominant frequency in a given range
        Useful for extracting heart rate from PPG
        
        Args:
            signal_data: Time-domain signal
            freq_range: (min_freq, max_freq) to search in Hz
        
        Returns:
            dominant_freq: Dominant frequency in Hz
            magnitude: Magnitude at dominant frequency
        """
        frequencies, magnitude, _ = self.compute_fft(signal_data)
        
        # Mask for frequency range
        mask = (frequencies >= freq_range[0]) & (frequencies <= freq_range[1])
        freq_subset = frequencies[mask]
        mag_subset = magnitude[mask]
        
        if len(mag_subset) == 0:
            return 0, 0
        
        # Find peak
        peak_idx = np.argmax(mag_subset)
        dominant_freq = freq_subset[peak_idx]
        peak_magnitude = mag_subset[peak_idx]
        
        return dominant_freq, peak_magnitude
    
    def extract_heart_rate(self, ppg_signal):
        """
        Extract heart rate from PPG signal
        
        Args:
            ppg_signal: PPG time-domain signal
        
        Returns:
            heart_rate_bpm: Heart rate in beats per minute
            confidence: Confidence measure (peak prominence)
        """
        # Heart rate typically 40-200 BPM = 0.67-3.33 Hz
        dominant_freq, magnitude = self.find_dominant_frequency(
            ppg_signal, freq_range=(0.67, 3.33)
        )
        
        heart_rate_bpm = dominant_freq * 60
        
        # Calculate confidence based on peak prominence
        frequencies, full_magnitude, _ = self.compute_fft(ppg_signal)
        mean_mag = np.mean(full_magnitude)
        confidence = magnitude / mean_mag if mean_mag > 0 else 0
        
        return heart_rate_bpm, confidence
    
    def extract_respiration_rate(self, signal_data):
        """
        Extract respiration rate from signal
        
        Args:
            signal_data: Time-domain signal (can be derived from PPG)
        
        Returns:
            resp_rate: Respiration rate in breaths per minute
        """
        # Respiration typically 8-30 breaths/min = 0.13-0.5 Hz
        dominant_freq, _ = self.find_dominant_frequency(
            signal_data, freq_range=(0.13, 0.5)
        )
        
        return dominant_freq * 60
    
    def spectral_entropy(self, signal_data):
        """
        Calculate spectral entropy - measure of signal complexity
        Useful for detecting signal quality
        
        Args:
            signal_data: Time-domain signal
        
        Returns:
            entropy: Spectral entropy value (0 = pure tone, higher = complex)
        """
        frequencies, psd = self.compute_psd(signal_data)
        
        # Normalize PSD to probability distribution
        psd_norm = psd / np.sum(psd)
        
        # Remove zeros to avoid log(0)
        psd_norm = psd_norm[psd_norm > 0]
        
        # Calculate entropy
        entropy = -np.sum(psd_norm * np.log2(psd_norm))
        
        return entropy


if __name__ == "__main__":
    # Demo
    from signal_generator import BiosignalGenerator
    
    gen = BiosignalGenerator(sample_rate=500)
    analyzer = FFTAnalyzer(sample_rate=500)
    
    # Generate PPG with known heart rate
    t, noisy_ppg, clean_ppg = gen.generate_ppg_signal(10, heart_rate_bpm=75)
    
    # Extract heart rate
    hr, confidence = analyzer.extract_heart_rate(noisy_ppg)
    
    print(f"True heart rate: 75 BPM")
    print(f"Extracted heart rate: {hr:.1f} BPM")
    print(f"Confidence: {confidence:.2f}")
