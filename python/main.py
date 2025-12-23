"""
Main Demo Application
Demonstrates the complete signal processing pipeline
"""
import numpy as np
from signal_generator import BiosignalGenerator
from dsp_filters import DSPFilters
from fft_analyzer import FFTAnalyzer

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def demo_ppg_processing():
    """Demonstrate PPG signal processing pipeline"""
    print_header("PPG Signal Processing Demo")
    
    # Initialize components
    sample_rate = 500  # Hz
    gen = BiosignalGenerator(sample_rate=sample_rate)
    filters = DSPFilters(sample_rate=sample_rate)
    analyzer = FFTAnalyzer(sample_rate=sample_rate)
    
    # Generate noisy PPG signal
    true_hr = 72  # BPM
    duration = 10  # seconds
    t, noisy_signal, clean_signal = gen.generate_ppg_signal(
        duration, heart_rate_bpm=true_hr, noise_level=0.5
    )
    
    print(f"\n1. Generated {duration}s of PPG signal at {sample_rate}Hz")
    print(f"   True heart rate: {true_hr} BPM")
    print(f"   Signal samples: {len(t)}")
    
    # Apply filtering pipeline
    print("\n2. Applying filter pipeline:")
    
    # Step 1: Remove baseline drift (high-pass)
    filtered = filters.butterworth_highpass(noisy_signal, cutoff_freq=0.5)
    print("   - High-pass filter (0.5 Hz) to remove baseline drift")
    
    # Step 2: Remove high-frequency noise (low-pass)
    filtered = filters.butterworth_lowpass(filtered, cutoff_freq=10)
    print("   - Low-pass filter (10 Hz) to remove high-frequency noise")
    
    # Step 3: Remove powerline interference
    filtered = filters.notch_filter(filtered, notch_freq=50)
    print("   - Notch filter (50 Hz) to remove powerline interference")
    
    # Calculate noise reduction
    noise_before = np.std(noisy_signal - clean_signal)
    noise_after = np.std(filtered - clean_signal)
    reduction = (1 - noise_after/noise_before) * 100
    
    print(f"\n3. Noise Analysis:")
    print(f"   Noise before filtering: {noise_before:.4f}")
    print(f"   Noise after filtering: {noise_after:.4f}")
    print(f"   Noise reduction: {reduction:.1f}%")
    
    # Extract heart rate using FFT
    print("\n4. Heart Rate Extraction (FFT Analysis):")
    
    # From noisy signal
    hr_noisy, conf_noisy = analyzer.extract_heart_rate(noisy_signal)
    print(f"   From noisy signal: {hr_noisy:.1f} BPM (confidence: {conf_noisy:.2f})")
    
    # From filtered signal
    hr_filtered, conf_filtered = analyzer.extract_heart_rate(filtered)
    print(f"   From filtered signal: {hr_filtered:.1f} BPM (confidence: {conf_filtered:.2f})")
    
    # Error calculation
    error_noisy = abs(hr_noisy - true_hr)
    error_filtered = abs(hr_filtered - true_hr)
    print(f"\n   Error (noisy): {error_noisy:.1f} BPM")
    print(f"   Error (filtered): {error_filtered:.1f} BPM")
    
    return t, noisy_signal, filtered, clean_signal

def demo_ecg_processing():
    """Demonstrate ECG signal processing"""
    print_header("ECG Signal Processing Demo")
    
    sample_rate = 500
    gen = BiosignalGenerator(sample_rate=sample_rate)
    filters = DSPFilters(sample_rate=sample_rate)
    
    # Generate ECG
    true_hr = 80
    t, noisy_ecg, clean_ecg = gen.generate_ecg_signal(
        duration=5, heart_rate_bpm=true_hr, noise_level=0.15
    )
    
    print(f"\n1. Generated ECG signal at {true_hr} BPM")
    
    # ECG filtering pipeline
    # Band-pass: 0.5 - 40 Hz (typical ECG bandwidth)
    filtered = filters.butterworth_bandpass(noisy_ecg, 0.5, 40)
    filtered = filters.notch_filter(filtered, 50)
    
    print("2. Applied band-pass filter (0.5-40 Hz) and notch filter")
    
    # Simple QRS detection (peak finding)
    threshold = 0.5 * np.max(filtered)
    peaks = []
    for i in range(1, len(filtered)-1):
        if filtered[i] > threshold and filtered[i] > filtered[i-1] and filtered[i] > filtered[i+1]:
            if len(peaks) == 0 or i - peaks[-1] > sample_rate * 0.3:  # Min 0.3s between beats
                peaks.append(i)
    
    if len(peaks) > 1:
        rr_intervals = np.diff(peaks) / sample_rate  # in seconds
        avg_rr = np.mean(rr_intervals)
        detected_hr = 60 / avg_rr
        print(f"\n3. QRS Detection:")
        print(f"   Detected {len(peaks)} R-peaks")
        print(f"   Average RR interval: {avg_rr*1000:.0f} ms")
        print(f"   Calculated heart rate: {detected_hr:.1f} BPM")
        print(f"   True heart rate: {true_hr} BPM")

def demo_real_time_buffer():
    """Demonstrate circular buffer for real-time processing"""
    print_header("Real-Time Buffer Demo (Simulated)")
    
    from collections import deque
    
    class CircularBuffer:
        """Circular buffer for real-time data acquisition"""
        def __init__(self, size):
            self.buffer = deque(maxlen=size)
            self.size = size
        
        def add(self, value):
            self.buffer.append(value)
        
        def is_full(self):
            return len(self.buffer) == self.size
        
        def get_data(self):
            return np.array(self.buffer)
        
        def get_mean(self):
            return np.mean(self.buffer) if self.buffer else 0
    
    # Simulate real-time data acquisition
    buffer_size = 500  # 1 second at 500 Hz
    buffer = CircularBuffer(buffer_size)
    
    gen = BiosignalGenerator(sample_rate=500)
    t, signal, _ = gen.generate_ppg_signal(5, heart_rate_bpm=70)
    
    print(f"\n1. Created circular buffer (size={buffer_size})")
    print("2. Simulating real-time data acquisition...")
    
    # Simulate streaming data
    processed_windows = 0
    for i, sample in enumerate(signal):
        buffer.add(sample)
        
        # Process when buffer is full (every 1 second)
        if buffer.is_full() and i % buffer_size == 0:
            data = buffer.get_data()
            mean = np.mean(data)
            std = np.std(data)
            processed_windows += 1
            
            if processed_windows <= 3:  # Show first 3 windows
                print(f"   Window {processed_windows}: mean={mean:.3f}, std={std:.3f}")
    
    print(f"\n3. Processed {processed_windows} windows of data")

def main():
    """Run all demos"""
    print("\n" + "#"*60)
    print("#  EMBEDDED SYSTEMS SIGNAL PROCESSING PROJECT")
    print("#  Vital Signs Monitoring Simulation")
    print("#"*60)
    
    # Run demos
    demo_ppg_processing()
    demo_ecg_processing()
    demo_real_time_buffer()
    
    print_header("Demo Complete!")
    print("\nThis project demonstrates key concepts for embedded systems:")
    print("  - Signal generation and noise modeling")
    print("  - Digital filtering (IIR, FIR, notch)")
    print("  - FFT analysis for frequency extraction")
    print("  - Real-time circular buffer patterns")
    print("\nReview the code in each module for detailed implementations.")

if __name__ == "__main__":
    main()
