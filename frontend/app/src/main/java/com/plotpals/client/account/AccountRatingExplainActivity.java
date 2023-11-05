package com.plotpals.client.account;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import com.plotpals.client.R;

public class AccountRatingExplainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_rating_explain);

        findViewById(R.id.arrow_back_).setOnClickListener(view -> finish());
    }
}