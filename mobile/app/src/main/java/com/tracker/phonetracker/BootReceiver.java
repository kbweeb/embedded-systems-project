package com.tracker.phonetracker;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) || 
            "android.intent.action.QUICKBOOT_POWERON".equals(action)) {
            
            SharedPreferences prefs = context.getSharedPreferences("tracker", Context.MODE_PRIVATE);
            boolean appInitialized = prefs.getBoolean("app_initialized", false);
            
            // Always start if app was ever opened (permissions were granted)
            if (appInitialized) {
                prefs.edit().putBoolean("service_running", true).apply();
                Intent serviceIntent = new Intent(context, LocationService.class);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent);
                } else {
                    context.startService(serviceIntent);
                }
            }
        }
    }
}
