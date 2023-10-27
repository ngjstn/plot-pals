package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

public class AccountMainActivity extends AppCompatActivity {
    final static String TAG = "AccountMainActivity";
    private View applyButton;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_account_main);

        applyButton = findViewById(R.id.account_apply_button);
        applyButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Log.d(TAG, "Clicking Garden App button");
                Intent gardenAppIntent = new Intent(AccountMainActivity.this, GardenApplicationActivity.class);
                startActivity(gardenAppIntent);
            }
        });

    }
}