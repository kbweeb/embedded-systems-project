/**
 * Circular Buffer (Ring Buffer) Implementation
 * Common pattern in embedded systems for real-time data acquisition
 * 
 * Key advantages:
 * - Fixed memory allocation (no malloc in real-time code)
 * - O(1) insert and remove
 * - Automatic overwrite of old data
 */

#ifndef CIRCULAR_BUFFER_H
#define CIRCULAR_BUFFER_H

#include <stdint.h>
#include <stdbool.h>

#define BUFFER_SIZE 256  // Power of 2 for efficient modulo

typedef struct {
    float data[BUFFER_SIZE];
    uint16_t head;       // Write position
    uint16_t tail;       // Read position
    uint16_t count;      // Number of elements
} CircularBuffer;

/**
 * Initialize the buffer
 * @param cb Pointer to CircularBuffer structure
 */
void cb_init(CircularBuffer *cb);

/**
 * Add element to buffer
 * @param cb Pointer to CircularBuffer
 * @param value Value to add
 * @return true if successful, false if buffer was full (overwrites oldest)
 */
bool cb_push(CircularBuffer *cb, float value);

/**
 * Remove and return oldest element
 * @param cb Pointer to CircularBuffer
 * @param value Pointer to store the removed value
 * @return true if successful, false if buffer was empty
 */
bool cb_pop(CircularBuffer *cb, float *value);

/**
 * Check if buffer is empty
 * @param cb Pointer to CircularBuffer
 * @return true if empty
 */
bool cb_is_empty(CircularBuffer *cb);

/**
 * Check if buffer is full
 * @param cb Pointer to CircularBuffer
 * @return true if full
 */
bool cb_is_full(CircularBuffer *cb);

/**
 * Get number of elements in buffer
 * @param cb Pointer to CircularBuffer
 * @return Number of elements
 */
uint16_t cb_count(CircularBuffer *cb);

/**
 * Get element at index without removing
 * @param cb Pointer to CircularBuffer
 * @param index Index from tail (0 = oldest)
 * @param value Pointer to store the value
 * @return true if index valid
 */
bool cb_peek(CircularBuffer *cb, uint16_t index, float *value);

/**
 * Calculate mean of all elements in buffer
 * @param cb Pointer to CircularBuffer
 * @return Mean value, 0 if empty
 */
float cb_mean(CircularBuffer *cb);

/**
 * Clear the buffer
 * @param cb Pointer to CircularBuffer
 */
void cb_clear(CircularBuffer *cb);

#endif // CIRCULAR_BUFFER_H
