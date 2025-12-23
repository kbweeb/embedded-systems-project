package com.tracker.phonetracker;

import android.Manifest;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {
    private static final int LOCATION_PERMISSION_REQUEST = 1001;
    private static final int BACKGROUND_LOCATION_REQUEST = 1002;
    
    private TextView statusText;
    private Button actionButton;
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        statusText = findViewById(R.id.statusText);
        actionButton = findViewById(R.id.actionButton);
        prefs = getSharedPreferences("tracker", MODE_PRIVATE);
        
        actionButton.setOnClickListener(v -> handleAction());
        
        updateUI();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        updateUI();
    }
    
    private void handleAction() {
        if (!hasLocationPermission()) {
            requestLocationPermission();
        } else if (!hasBackgroundLocationPermission()) {
            requestBackgroundLocationPermission();
        } else if (!isServiceRunning()) {
            startTrackingService();
        } else {
            stopTrackingService();
        }
    }
    
    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) 
            == PackageManager.PERMISSION_GRANTED;
    }
    
    private boolean hasBackgroundLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) 
                == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }
    
    private void requestLocationPermission() {
        ActivityCompat.requestPermissions(this,
            new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            },
            LOCATION_PERMISSION_REQUEST);
    }
    
    private void requestBackgroundLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.ACCESS_BACKGROUND_LOCATION},
                BACKGROUND_LOCATION_REQUEST);
        }
    }
    
    private boolean isServiceRunning() {
        return prefs.getBoolean("service_running", false);
    }
    
    private void startTrackingService() {
        requestBatteryOptimizationExemption();
        
        Intent intent = new Intent(this, LocationService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }
        prefs.edit().putBoolean("service_running", true).apply();
        updateUI();
        
        Toast.makeText(this, "Tracking started", Toast.LENGTH_SHORT).show();
    }
    
    private void stopTrackingService() {
        Intent intent = new Intent(this, LocationService.class);
        stopService(intent);
        prefs.edit().putBoolean("service_running", false).apply();
        updateUI();
        
        Toast.makeText(this, "Tracking stopped", Toast.LENGTH_SHORT).show();
    }
    
    private void requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            if (!pm.isIgnoringBatteryOptimizations(getPackageName())) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + getPackageName()));
                startActivity(intent);
            }
        }
    }
    
    private void updateUI() {
        if (!hasLocationPermission()) {
            statusText.setText("Location permission required");
            actionButton.setText("Grant Permission");
        } else if (!hasBackgroundLocationPermission()) {
            statusText.setText("Background location required\nSelect 'Allow all the time'");
            actionButton.setText("Grant Background Access");
        } else if (isServiceRunning()) {
            statusText.setText("Tracking Active\nLocation is being shared");
            actionButton.setText("Stop Tracking");
        } else {
            statusText.setText("Ready to track\nTap to start");
            actionButton.setText("Start Tracking");
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == LOCATION_PERMISSION_REQUEST) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (!hasBackgroundLocationPermission()) {
                    requestBackgroundLocationPermission();
                }
            }
        }
        updateUI();
    }
}
