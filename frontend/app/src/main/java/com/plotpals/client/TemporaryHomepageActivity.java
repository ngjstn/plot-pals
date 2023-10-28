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

        activateNavBar();

    }


    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}