package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import com.plotpals.client.R;

public class NavBarActivity extends AppCompatActivity {

    final static String TAG = "NavBarActivity";
    private Button homeButton;
    private Button gardenButton;
    private Button accountButton;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        homeButton = findViewById(R.id.button_navbar_home);
        homeButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Home Button");
            Intent accountIntent = new Intent(NavBarActivity.this, TemporaryHomepageActivity.class);
            startActivity(accountIntent);
        });

        //uncomment when garden home page is done
        //gardenButton = findViewById(R.id.button_navbar_garden);
        //gardenButton.setOnClickListener(view -> {
        //    Log.d(TAG, "Clicking My Garden Button");
        //    Intent accountIntent = new Intent(NavBarActivity.this, GardenMainActivity.class);
        //    startActivity(accountIntent);
        //});

        accountButton = findViewById(R.id.button_navbar_account);
        accountButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Account Button");
            Intent accountIntent = new Intent(NavBarActivity.this, AccountMainActivity.class);
            startActivity(accountIntent);
        });

    }
}