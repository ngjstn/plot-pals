package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

public class MyGardenYesGardenActivity extends NavBarActivity {
    final static String TAG = "MyGardenNoGardenActivity";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_garden_no_garden);

        activateNavBar();
    }
}