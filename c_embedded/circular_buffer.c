/**
 * Circular Buffer Implementation
 * Efficient ring buffer for embedded real-time systems
 */

#include "circular_buffer.h"

void cb_init(CircularBuffer *cb) {
    cb->head = 0;
    cb->tail = 0;
    cb->count = 0;
    
    // Optional: Initialize data to zero
    for (int i = 0; i < BUFFER_SIZE; i++) {
        cb->data[i] = 0.0f;
    }
}

bool cb_push(CircularBuffer *cb, float value) {
    bool was_full = cb_is_full(cb);
    
    // Write to head position
    cb->data[cb->head] = value;
    
    // Advance head (use bitwise AND for power-of-2 buffer size)
    cb->head = (cb->head + 1) & (BUFFER_SIZE - 1);
    
    if (was_full) {
        // Overwrite oldest - advance tail too
        cb->tail = (cb->tail + 1) & (BUFFER_SIZE - 1);
        return false;  // Indicate overflow
    } else {
        cb->count++;
        return true;
    }
}

bool cb_pop(CircularBuffer *cb, float *value) {
    if (cb_is_empty(cb)) {
        return false;
    }
    
    // Read from tail position
    *value = cb->data[cb->tail];
    
    // Advance tail
    cb->tail = (cb->tail + 1) & (BUFFER_SIZE - 1);
    cb->count--;
    
    return true;
}

bool cb_is_empty(CircularBuffer *cb) {
    return cb->count == 0;
}

bool cb_is_full(CircularBuffer *cb) {
    return cb->count == BUFFER_SIZE;
}

uint16_t cb_count(CircularBuffer *cb) {
    return cb->count;
}

bool cb_peek(CircularBuffer *cb, uint16_t index, float *value) {
    if (index >= cb->count) {
        return false;
    }
    
    uint16_t actual_index = (cb->tail + index) & (BUFFER_SIZE - 1);
    *value = cb->data[actual_index];
    return true;
}

float cb_mean(CircularBuffer *cb) {
    if (cb_is_empty(cb)) {
        return 0.0f;
    }
    
    float sum = 0.0f;
    uint16_t idx = cb->tail;
    
    for (uint16_t i = 0; i < cb->count; i++) {
        sum += cb->data[idx];
        idx = (idx + 1) & (BUFFER_SIZE - 1);
    }
    
    return sum / cb->count;
}

void cb_clear(CircularBuffer *cb) {
    cb->head = 0;
    cb->tail = 0;
    cb->count = 0;
}
