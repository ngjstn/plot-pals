package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import com.plotpals.client.utils.GoogleProfileInformation;

public class EditGardenActivity extends AppCompatActivity {
    final static String TAG = "EditGardenActivity";
    static GoogleProfileInformation googleProfileInformation;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_garden);
        loadExtras();

        findViewById(R.id.close_icon).setOnClickListener(view -> finish());
        findViewById(R.id.check_icon).setOnClickListener(view -> finish());
    }

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}