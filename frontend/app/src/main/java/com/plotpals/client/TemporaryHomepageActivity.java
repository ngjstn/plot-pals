package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

/**
 * Temporary home page to route to feature pages
 */
public class TemporaryHomepageActivity extends NavBarActivity {
    final static String TAG = "TemporaryHomepageActivity";
    private Button mapsButton;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_temporary_homepage);

        /**
         * Insert buttons for feature pages here
         */

        mapsButton = findViewById(R.id.maps_button);
        mapsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Log.d(TAG, "Clicking Google Maps Button");
                Intent mapsIntent = new Intent(TemporaryHomepageActivity.this, MapsActivity.class);
                startActivity(mapsIntent);
            }
        });

    }
}