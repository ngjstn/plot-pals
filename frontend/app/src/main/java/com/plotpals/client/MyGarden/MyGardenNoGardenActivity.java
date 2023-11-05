package com.plotpals.client.MyGarden;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import com.plotpals.client.GardenDiscovery.GardenDiscoveryMapsActivity;
import com.plotpals.client.NavBarActivity;
import com.plotpals.client.R;
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
            Intent mapsIntent = new Intent(MyGardenNoGardenActivity.this, GardenDiscoveryMapsActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(mapsIntent);
            startActivity(mapsIntent);
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