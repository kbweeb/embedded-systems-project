"""
Digital Signal Processing Filters
Implements common filters used in embedded biosignal processing
"""
import numpy as np
from scipy import signal

class DSPFilters:
    """Collection of digital filters for signal processing"""
    
    def __init__(self, sample_rate=1000):
        self.sample_rate = sample_rate
    
    def butterworth_lowpass(self, data, cutoff_freq, order=4):
        """
        Butterworth low-pass filter
        Removes high-frequency noise while preserving signal shape
        
        Args:
            data: Input signal
            cutoff_freq: Cutoff frequency in Hz
            order: Filter order (higher = sharper cutoff)
        
        Returns:
            Filtered signal
        """
        nyquist = self.sample_rate / 2
        normalized_cutoff = cutoff_freq / nyquist
        b, a = signal.butter(order, normalized_cutoff, btype='low')
        return signal.filtfilt(b, a, data)
    
    def butterworth_highpass(self, data, cutoff_freq, order=4):
        """
        Butterworth high-pass filter
        Removes low-frequency drift/baseline wander
        
        Args:
            data: Input signal
            cutoff_freq: Cutoff frequency in Hz
            order: Filter order
        
        Returns:
            Filtered signal
        """
        nyquist = self.sample_rate / 2
        normalized_cutoff = cutoff_freq / nyquist
        b, a = signal.butter(order, normalized_cutoff, btype='high')
        return signal.filtfilt(b, a, data)
    
    def butterworth_bandpass(self, data, low_freq, high_freq, order=4):
        """
        Butterworth band-pass filter
        Isolates signals within a specific frequency range
        
        Args:
            data: Input signal
            low_freq: Lower cutoff frequency in Hz
            high_freq: Upper cutoff frequency in Hz
            order: Filter order
        
        Returns:
            Filtered signal
        """
        nyquist = self.sample_rate / 2
        low = low_freq / nyquist
        high = high_freq / nyquist
        b, a = signal.butter(order, [low, high], btype='band')
        return signal.filtfilt(b, a, data)
    
    def notch_filter(self, data, notch_freq=50, quality_factor=30):
        """
        Notch filter to remove specific frequency (e.g., powerline interference)
        
        Args:
            data: Input signal
            notch_freq: Frequency to remove (50Hz or 60Hz typically)
            quality_factor: Sharpness of notch
        
        Returns:
            Filtered signal
        """
        nyquist = self.sample_rate / 2
        normalized_freq = notch_freq / nyquist
        b, a = signal.iirnotch(normalized_freq, quality_factor)
        return signal.filtfilt(b, a, data)
    
    def moving_average(self, data, window_size=5):
        """
        Simple moving average filter
        Often used in embedded systems due to low computational cost
        
        Args:
            data: Input signal
            window_size: Number of samples to average
        
        Returns:
            Filtered signal
        """
        kernel = np.ones(window_size) / window_size
        # Pad to maintain signal length
        padded = np.pad(data, (window_size//2, window_size//2), mode='edge')
        filtered = np.convolve(padded, kernel, mode='valid')
        return filtered[:len(data)]
    
    def median_filter(self, data, window_size=5):
        """
        Median filter - excellent for removing spike noise
        
        Args:
            data: Input signal
            window_size: Window size (should be odd)
        
        Returns:
            Filtered signal
        """
        return signal.medfilt(data, kernel_size=window_size)
    
    def fir_filter(self, data, numtaps=51, cutoff=10, filter_type='lowpass'):
        """
        FIR (Finite Impulse Response) filter
        Advantages: Always stable, linear phase
        
        Args:
            data: Input signal
            numtaps: Number of filter coefficients
            cutoff: Cutoff frequency in Hz
            filter_type: 'lowpass', 'highpass', 'bandpass'
        
        Returns:
            Filtered signal
        """
        nyquist = self.sample_rate / 2
        normalized_cutoff = cutoff / nyquist
        coefficients = signal.firwin(numtaps, normalized_cutoff, pass_zero=filter_type)
        return signal.filtfilt(coefficients, [1.0], data)


class AdaptiveFilter:
    """
    LMS (Least Mean Squares) Adaptive Filter
    Useful for noise cancellation when reference noise is available
    """
    
    def __init__(self, filter_length=32, step_size=0.01):
        self.filter_length = filter_length
        self.step_size = step_size
        self.weights = np.zeros(filter_length)
    
    def filter(self, primary_signal, reference_noise):
        """
        Adaptive noise cancellation
        
        Args:
            primary_signal: Signal + noise
            reference_noise: Reference noise (correlated with noise in primary)
        
        Returns:
            Filtered signal with reduced noise
        """
        n = len(primary_signal)
        output = np.zeros(n)
        
        for i in range(self.filter_length, n):
            # Get reference window
            x = reference_noise[i-self.filter_length:i][::-1]
            
            # Filter output (estimated noise)
            estimated_noise = np.dot(self.weights, x)
            
            # Error (desired signal)
            error = primary_signal[i] - estimated_noise
            output[i] = error
            
            # Update weights (LMS algorithm)
            self.weights += 2 * self.step_size * error * x
        
        return output


if __name__ == "__main__":
    # Demo
    filters = DSPFilters(sample_rate=500)
    
    # Generate test signal
    t = np.linspace(0, 2, 1000)
    clean = np.sin(2 * np.pi * 5 * t)
    noisy = clean + 0.5 * np.random.randn(len(t))
    
    # Apply filter
    filtered = filters.butterworth_lowpass(noisy, cutoff_freq=10)
    
    print(f"Original noise level: {np.std(noisy - clean):.3f}")
    print(f"Filtered noise level: {np.std(filtered - clean):.3f}")
