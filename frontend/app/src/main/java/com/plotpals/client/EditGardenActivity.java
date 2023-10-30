package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.plotpals.client.utils.GoogleProfileInformation;

public class EditGardenActivity extends AppCompatActivity {
    final static String TAG = "EditGardenActivity";
    static GoogleProfileInformation googleProfileInformation;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_garden);
        loadExtras();

        findViewById(R.id.close_icon).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent manageActivity = new Intent(EditGardenActivity.this, ManageGardenActivity.class);
                startActivity(manageActivity);
            }
        });

        findViewById(R.id.check_icon).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent manageActivity = new Intent(EditGardenActivity.this, ManageGardenActivity.class);
                startActivity(manageActivity);
            }
        });
    }

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}