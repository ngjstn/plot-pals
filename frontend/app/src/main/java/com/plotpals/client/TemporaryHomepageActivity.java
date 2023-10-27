package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

/**
 * Temporary home page to route to feature pages
 */
public class TemporaryHomepageActivity extends AppCompatActivity {
    final static String TAG = "TemporaryHomepageActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_temporary_homepage);

        //ActivateNavBar();

        Button mapsButton = findViewById(R.id.maps_button);
        mapsButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Google Maps Button");
            Intent mapsIntent = new Intent(TemporaryHomepageActivity.this, MapsActivity.class);
            startActivity(mapsIntent);
        });

    }
}