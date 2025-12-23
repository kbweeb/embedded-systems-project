/**
 * Moving Average Filter Implementation
 * Optimized for embedded systems
 */

#include "moving_average.h"

void ma_init(MovingAverage *ma) {
    ma->sum = 0;
    ma->index = 0;
    ma->count = 0;
    
    for (int i = 0; i < MA_WINDOW_SIZE; i++) {
        ma->buffer[i] = 0;
    }
}

int32_t ma_filter(MovingAverage *ma, int32_t new_sample) {
    // Subtract oldest value from sum
    ma->sum -= ma->buffer[ma->index];
    
    // Add new value
    ma->buffer[ma->index] = new_sample;
    ma->sum += new_sample;
    
    // Advance index (circular)
    ma->index = (ma->index + 1) & (MA_WINDOW_SIZE - 1);
    
    // Track how many samples we have (for startup)
    if (ma->count < MA_WINDOW_SIZE) {
        ma->count++;
    }
    
    // Return average using bit shift (faster than division)
    // This works because MA_WINDOW_SIZE is power of 2
    if (ma->count == MA_WINDOW_SIZE) {
        return ma->sum >> MA_WINDOW_SHIFT;
    } else {
        // During startup, divide by actual count
        return ma->sum / ma->count;
    }
}

void ma_reset(MovingAverage *ma) {
    ma_init(ma);
}

int32_t ma_get_average(MovingAverage *ma) {
    if (ma->count == 0) {
        return 0;
    }
    
    if (ma->count == MA_WINDOW_SIZE) {
        return ma->sum >> MA_WINDOW_SHIFT;
    }
    
    return ma->sum / ma->count;
}
