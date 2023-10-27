package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

public class MyGardenNoGardenActivity extends NavBarActivity {
    final static String TAG = "MyGardenNoGardenActivity";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_garden_no_garden);

        activateNavBar();

        Button mapsButton = findViewById(R.id.maps_button);
        mapsButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Google Maps Button");
            Intent mapsIntent = new Intent(MyGardenNoGardenActivity.this, MapsActivity.class);
            startActivity(mapsIntent);
        });
    }
}