/**
 * Moving Average Filter
 * Simple and efficient digital filter for embedded systems
 * 
 * Advantages:
 * - Very low computational cost
 * - No floating point division in ISR (use power-of-2 window)
 * - Good for smoothing sensor data
 */

#ifndef MOVING_AVERAGE_H
#define MOVING_AVERAGE_H

#include <stdint.h>

// Window size must be power of 2 for efficient division
#define MA_WINDOW_SIZE 8
#define MA_WINDOW_SHIFT 3  // log2(MA_WINDOW_SIZE)

typedef struct {
    int32_t buffer[MA_WINDOW_SIZE];
    int32_t sum;
    uint8_t index;
    uint8_t count;
} MovingAverage;

/**
 * Initialize the moving average filter
 * @param ma Pointer to MovingAverage structure
 */
void ma_init(MovingAverage *ma);

/**
 * Add new sample and get filtered output
 * @param ma Pointer to MovingAverage
 * @param new_sample New input sample
 * @return Filtered output (average of last N samples)
 */
int32_t ma_filter(MovingAverage *ma, int32_t new_sample);

/**
 * Reset the filter
 * @param ma Pointer to MovingAverage
 */
void ma_reset(MovingAverage *ma);

/**
 * Get current average without adding new sample
 * @param ma Pointer to MovingAverage
 * @return Current average
 */
int32_t ma_get_average(MovingAverage *ma);

#endif // MOVING_AVERAGE_H
