/**
 * Main Demo - Embedded Systems Signal Processing
 * 
 * This demonstrates:
 * 1. Circular buffer for data acquisition
 * 2. Moving average filter for noise reduction
 * 3. Simple peak detection
 * 
 * Compile: gcc -o demo main.c circular_buffer.c moving_average.c -lm
 * Run: ./demo
 */

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>
#include "circular_buffer.h"
#include "moving_average.h"

#define SAMPLE_RATE 500
#define SIGNAL_DURATION 5
#define NUM_SAMPLES (SAMPLE_RATE * SIGNAL_DURATION)
#define PI 3.14159265358979323846

// Simulated ADC reading (in real embedded system, this reads from hardware)
float read_adc_simulated(float time, float heart_rate_hz) {
    // Simulate PPG signal with noise
    float clean = sinf(2 * PI * heart_rate_hz * time) +
                  0.5f * sinf(2 * PI * 2 * heart_rate_hz * time);
    
    // Add noise
    float noise = ((float)rand() / RAND_MAX - 0.5f) * 0.6f;
    
    return clean + noise;
}

// Simple peak detector
typedef struct {
    float threshold;
    float last_value;
    int last_peak_sample;
    int min_peak_distance;  // Minimum samples between peaks
} PeakDetector;

void peak_detector_init(PeakDetector *pd, float threshold, int min_distance) {
    pd->threshold = threshold;
    pd->last_value = 0;
    pd->last_peak_sample = -1000;
    pd->min_peak_distance = min_distance;
}

// Returns 1 if peak detected, 0 otherwise
int peak_detector_update(PeakDetector *pd, float value, int sample_num) {
    int is_peak = 0;
    
    // Check if this is a peak
    if (value > pd->threshold && 
        value > pd->last_value &&
        (sample_num - pd->last_peak_sample) > pd->min_peak_distance) {
        is_peak = 1;
        pd->last_peak_sample = sample_num;
    }
    
    pd->last_value = value;
    return is_peak;
}

int main() {
    printf("=========================================\n");
    printf("  Embedded Systems DSP Demo (C)\n");
    printf("=========================================\n\n");
    
    // Seed random number generator
    srand(time(NULL));
    
    // Initialize components
    CircularBuffer buffer;
    MovingAverage filter;
    PeakDetector peak_det;
    
    cb_init(&buffer);
    ma_init(&filter);
    peak_detector_init(&peak_det, 0.5f, SAMPLE_RATE / 3);  // Max 180 BPM
    
    float heart_rate_hz = 72.0f / 60.0f;  // 72 BPM
    
    printf("1. Simulating %d seconds of data acquisition at %d Hz\n", 
           SIGNAL_DURATION, SAMPLE_RATE);
    printf("   True heart rate: 72 BPM (%.2f Hz)\n\n", heart_rate_hz);
    
    // Arrays for analysis
    float raw_samples[NUM_SAMPLES];
    float filtered_samples[NUM_SAMPLES];
    int peak_samples[100];
    int peak_count = 0;
    
    // Simulate data acquisition loop
    printf("2. Processing samples...\n");
    
    for (int i = 0; i < NUM_SAMPLES; i++) {
        float time = (float)i / SAMPLE_RATE;
        
        // Read ADC (simulated)
        float raw_value = read_adc_simulated(time, heart_rate_hz);
        raw_samples[i] = raw_value;
        
        // Add to circular buffer
        cb_push(&buffer, raw_value);
        
        // Apply moving average filter
        int32_t raw_int = (int32_t)(raw_value * 1000);  // Scale for integer filter
        int32_t filtered_int = ma_filter(&filter, raw_int);
        float filtered_value = filtered_int / 1000.0f;
        filtered_samples[i] = filtered_value;
        
        // Peak detection
        if (peak_detector_update(&peak_det, filtered_value, i)) {
            if (peak_count < 100) {
                peak_samples[peak_count++] = i;
            }
        }
    }
    
    printf("   Processed %d samples\n", NUM_SAMPLES);
    printf("   Buffer mean: %.3f\n", cb_mean(&buffer));
    
    // Calculate noise reduction
    float raw_variance = 0, filtered_variance = 0;
    float raw_mean = 0, filtered_mean = 0;
    
    for (int i = 0; i < NUM_SAMPLES; i++) {
        raw_mean += raw_samples[i];
        filtered_mean += filtered_samples[i];
    }
    raw_mean /= NUM_SAMPLES;
    filtered_mean /= NUM_SAMPLES;
    
    for (int i = 0; i < NUM_SAMPLES; i++) {
        raw_variance += (raw_samples[i] - raw_mean) * (raw_samples[i] - raw_mean);
        filtered_variance += (filtered_samples[i] - filtered_mean) * 
                            (filtered_samples[i] - filtered_mean);
    }
    raw_variance /= NUM_SAMPLES;
    filtered_variance /= NUM_SAMPLES;
    
    printf("\n3. Noise Analysis:\n");
    printf("   Raw signal std dev: %.4f\n", sqrtf(raw_variance));
    printf("   Filtered signal std dev: %.4f\n", sqrtf(filtered_variance));
    printf("   Noise reduction: %.1f%%\n", 
           (1 - sqrtf(filtered_variance) / sqrtf(raw_variance)) * 100);
    
    // Calculate heart rate from peaks
    printf("\n4. Heart Rate Detection:\n");
    printf("   Detected %d peaks\n", peak_count);
    
    if (peak_count > 1) {
        float total_interval = 0;
        for (int i = 1; i < peak_count; i++) {
            total_interval += (peak_samples[i] - peak_samples[i-1]);
        }
        float avg_interval = total_interval / (peak_count - 1);
        float detected_hr = (SAMPLE_RATE / avg_interval) * 60;
        
        printf("   Average peak interval: %.1f samples (%.0f ms)\n", 
               avg_interval, avg_interval * 1000 / SAMPLE_RATE);
        printf("   Detected heart rate: %.1f BPM\n", detected_hr);
        printf("   True heart rate: 72.0 BPM\n");
        printf("   Error: %.1f BPM\n", fabsf(detected_hr - 72.0f));
    }
    
    printf("\n=========================================\n");
    printf("  Demo Complete!\n");
    printf("=========================================\n");
    
    return 0;
}
