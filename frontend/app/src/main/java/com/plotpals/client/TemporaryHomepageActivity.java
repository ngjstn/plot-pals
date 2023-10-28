package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import com.plotpals.client.utils.GoogleProfileInformation;
import androidx.appcompat.app.AppCompatActivity;

/**
 * Temporary home page to route to feature pages
 */
public class TemporaryHomepageActivity extends NavBarActivity {
    final static String TAG = "TemporaryHomepageActivity";

    GoogleProfileInformation googleProfileInformation;
    private Button actualHomepageButton;
    private Button mapsButton;
    private Button accountButton;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_temporary_homepage);
        loadExtras();
        /**
         * Insert buttons for feature pages here
         */

        actualHomepageButton = findViewById(R.id.actual_homepage_button);
        actualHomepageButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Homepage Button");
            Intent homepageIntent = new Intent(TemporaryHomepageActivity.this, HomepageActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(homepageIntent);
            startActivity(homepageIntent);
        });

        mapsButton = findViewById(R.id.maps_button);
        mapsButton.setOnClickListener(new View.OnClickListener() {
          @Override
          public void onClick(View view) {
              Log.d(TAG, "Clicking Google Maps Button");
              Intent mapsIntent = new Intent(TemporaryHomepageActivity.this, MapsActivity.class);
              startActivity(mapsIntent);
          }
        });
        activateNavBar();
        Button mapsButton = findViewById(R.id.maps_button);
        mapsButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Google Maps Button");
            Intent mapsIntent = new Intent(TemporaryHomepageActivity.this, MapsActivity.class);
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