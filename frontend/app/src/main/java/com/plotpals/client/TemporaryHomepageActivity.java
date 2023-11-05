package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import com.plotpals.client.utils.GoogleProfileInformation;

/**
 * Temporary home page to route to feature pages
 */
public class TemporaryHomepageActivity extends NavBarActivity {
    final static String TAG = "TemporaryHomepageActivity";

    GoogleProfileInformation googleProfileInformation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_temporary_homepage);
        loadExtras();
        /**
         * Insert buttons for feature pages here
         */

        Button actualHomepageButton = findViewById(R.id.actual_homepage_button);
        actualHomepageButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Homepage Button");
            Intent homepageIntent = new Intent(TemporaryHomepageActivity.this, HomepageActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(homepageIntent);
            startActivity(homepageIntent);
        });

        activateNavBar();
        Button mapsButton = findViewById(R.id.maps_button);
        mapsButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Google Maps Button");
            Intent mapsIntent = new Intent(TemporaryHomepageActivity.this, MapsActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(mapsIntent);
            startActivity(mapsIntent);
        });

    }


    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}