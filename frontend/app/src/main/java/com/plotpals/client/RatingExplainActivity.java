package com.plotpals.client;

import android.os.Bundle;

public class RatingExplainActivity extends NavBarActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_rating_explain);
        activateNavBar();

        findViewById(R.id.arrow_back_).setOnClickListener(view -> finish());
    }
}