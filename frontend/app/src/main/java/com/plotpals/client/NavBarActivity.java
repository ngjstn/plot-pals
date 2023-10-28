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
    protected void activateNavBar() {
        Button homeButton = findViewById(R.id.button_navbar_home);
        homeButton.setOnClickListener(v -> {
            Log.d(TAG, "Clicking Home Button");
            Intent intent = new Intent(NavBarActivity.this, HomepageActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
        });

        Button gardenButton = findViewById(R.id.button_navbar_garden);
        gardenButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking My Garden Button");
            Intent intent = new Intent(NavBarActivity.this, MyGardenNoGardenActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
        });

        Button accountButton = findViewById(R.id.button_navbar_account);
        accountButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Account Button");
            Intent intent = new Intent(NavBarActivity.this, AccountMainActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
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