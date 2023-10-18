package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.widget.TextView;

import com.plotpals.client.utils.GoogleProfileInformation;

public class HomepageActivity extends AppCompatActivity {

    TextView HomepageTitleTextView;
    GoogleProfileInformation googleProfileInformation;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_homepage);
        loadExtras();

        HomepageTitleTextView = findViewById(R.id.homepage_title_text_view);
    }

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}