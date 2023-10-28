package com.plotpals.client;

import android.os.Bundle;

public class MyGardenYesGardenActivity extends NavBarActivity {
    final static String TAG = "MyGardenYesGardenActivity";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_garden_yes_garden);

        activateNavBar();
    }
}