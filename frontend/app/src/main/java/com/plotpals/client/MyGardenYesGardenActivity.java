package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;

import com.plotpals.client.utils.GoogleProfileInformation;

public class MyGardenYesGardenActivity extends NavBarActivity {
    final static String TAG = "MyGardenYesGardenActivity";
    GoogleProfileInformation googleProfileInformation;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_garden_yes_garden);
        loadExtras();
        activateNavBar();

        ImageView plusButton = findViewById(R.id.my_garden_plus_button);
        plusButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Google Maps Button");
            Intent mapsIntent = new Intent(MyGardenYesGardenActivity.this, MapsActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(mapsIntent);
            startActivity(mapsIntent);
        });

        Button forumButton = findViewById(R.id.my_garden_1_forum);
        forumButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Forum Button");
            Intent intent = new Intent(MyGardenYesGardenActivity.this, ForumBoardMainActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
        });

        findViewById(R.id.my_garden_1_manage).setOnClickListener(view -> {
            Log.d(TAG, "Clicking Manage Button");
            Intent intent = new Intent(MyGardenYesGardenActivity.this, ManageGardenActivity.class);
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