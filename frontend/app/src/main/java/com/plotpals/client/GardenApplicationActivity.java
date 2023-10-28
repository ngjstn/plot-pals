package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class GardenApplicationActivity extends AppCompatActivity {
    private Button nextButton;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_application);

        // Create an instance of your Fragment (FragGAInfoPage)
        Fragment fragGAInfoPage = new FragGAInfoPage();
        Fragment fragGAContactPage = new FragGAContactPage();


        // Get the FragmentManager and begin a transaction
        FragmentManager fragmentManager = getSupportFragmentManager();
        FragmentTransaction initTransaction = fragmentManager.beginTransaction();

        // Add the fragment to the container (R.id.fragment_container_view)
        initTransaction.add(R.id.fragment_container_view, fragGAInfoPage);

        // Commit the transaction
        initTransaction.commit();

        nextButton = findViewById(R.id.next_button);
        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                FragmentTransaction contTransaction = fragmentManager.beginTransaction();
                contTransaction.replace(R.id.fragment_container_view, fragGAContactPage);
                contTransaction.commit();
            }
        });

    }
}