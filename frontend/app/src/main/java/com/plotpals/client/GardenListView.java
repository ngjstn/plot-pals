package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

public class GardenListView extends AppCompatActivity {

    // this activity class is only used for displaying the ListView search results
    // connects to the gardenBaseAdaptor in GardenSearchActivity to update list entries
    final static String TAG = "GardenListView";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_list_view);
    }
}