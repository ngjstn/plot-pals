package com.plotpals.client;

import android.os.Bundle;

public class AccountMainActivity extends NavBarActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_account_main);

        activateNavBar();
    }
}