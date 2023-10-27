package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.plotpals.client.utils.GoogleProfileInformation;

public class NavBarActivity extends AppCompatActivity {

    final static String TAG = "NavBarActivity";

    GoogleProfileInformation googleProfileInformation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_nav_bar);
        loadExtras();
    }
    protected void ActivateNavBar() {
        Button homeButton = findViewById(R.id.button_navbar_home);
        homeButton.setOnClickListener(v -> {
            Log.d(TAG, "Clicking Home Button");
            Intent accountIntent = new Intent(NavBarActivity.this, TemporaryHomepageActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(accountIntent);
            startActivity(accountIntent);
        });

        //uncomment when garden home page is done
        //Button gardenButton = findViewById(R.id.button_navbar_garden);
        //gardenButton.setOnClickListener(view -> {
        //    Log.d(TAG, "Clicking My Garden Button");
        //    Intent accountIntent = new Intent(NavBarActivity.this, GardenMainActivity.class);
        //    startActivity(accountIntent);
        //});

        Button accountButton = findViewById(R.id.button_navbar_account);
        accountButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Account Button");
            Intent accountIntent = new Intent(NavBarActivity.this, AccountMainActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(accountIntent);
            startActivity(accountIntent);
        });
    }

    /**
     * load extras forwarded from previous activity
     */
    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}