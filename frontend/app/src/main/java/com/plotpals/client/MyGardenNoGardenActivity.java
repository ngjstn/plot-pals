package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import com.plotpals.client.utils.GoogleProfileInformation;

public class MyGardenNoGardenActivity extends NavBarActivity {
    final static String TAG = "MyGardenNoGardenActivity";
    static GoogleProfileInformation googleProfileInformation;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_garden_no_garden);

        loadExtras();

        activateNavBar();
        Button mapsButton = findViewById(R.id.maps_button);
        mapsButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Google Maps Button");
            Intent mapsIntent = new Intent(MyGardenNoGardenActivity.this, MapsActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(mapsIntent);
            startActivity(mapsIntent);
        });

        Button tempButton = findViewById(R.id.temp_button_yes_garden);
        tempButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Temp Yes Garden Button");
            Intent intent = new Intent(MyGardenNoGardenActivity.this, MyGardenYesGardenActivity.class);
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