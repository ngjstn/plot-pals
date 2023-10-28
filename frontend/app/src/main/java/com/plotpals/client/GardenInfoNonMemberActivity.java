package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

import java.util.Map;

public class GardenInfoNonMemberActivity extends AppCompatActivity {
    final static String TAG = "GardenInfoNonMemberActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_info_non_member);

        findViewById(R.id.view_forum_).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(GardenInfoNonMemberActivity.this, "View Forum Board pressed", Toast.LENGTH_SHORT).show();
            }
        });

        findViewById(R.id.join).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(GardenInfoNonMemberActivity.this, "Join pressed", Toast.LENGTH_SHORT).show();
            }
        });

        findViewById(R.id.arrow_back_).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(GardenInfoNonMemberActivity.this, "Back Arrow pressed", Toast.LENGTH_SHORT).show();
                Intent mapsActivity = new Intent(GardenInfoNonMemberActivity.this, MapsActivity.class);
                startActivity(mapsActivity);
            }
        });
    }
}