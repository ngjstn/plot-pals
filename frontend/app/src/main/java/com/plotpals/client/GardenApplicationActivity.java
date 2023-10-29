package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.android.volley.RequestQueue;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.utils.GoogleProfileInformation;

import java.util.HashMap;

public class GardenApplicationActivity extends AppCompatActivity {
    private Button nextButton;
    GoogleProfileInformation googleProfileInformation;
    private boolean sendable;
    private EditText gardenName;
    private EditText gardenAddress;
    private EditText gardenPlots;
    private EditText gardenPhone;
    private EditText gardenEmail;
    private TextView contactName;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_application);
        loadExtras();
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);

        contactName = findViewById(R.id.garden_contact_name_loaded);
        contactName.setText(googleProfileInformation.getAccountGoogleName());

        gardenName = findViewById(R.id.garden_name_input);
        gardenAddress = findViewById(R.id.garden_address_input);
        gardenPlots = findViewById(R.id.garden_num_plots_input);
        gardenPhone = findViewById(R.id.garden_phone_number_input);
        gardenEmail = findViewById(R.id.garden_email_address_input);

        nextButton = findViewById(R.id.next_button);
        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent gardenAppConfIntent = new Intent(GardenApplicationActivity.this, GardenApplicationConfirmActivity.class);
                sendable = parseGardenInformation();
                if (sendable) {
                    gardenAppConfIntent.putExtra("gardenName", gardenName.getText().toString());
                    gardenAppConfIntent.putExtra("gardenAddress", gardenAddress.getText().toString());
                    gardenAppConfIntent.putExtra("gardenPlots", gardenPlots.getText().toString());
                    gardenAppConfIntent.putExtra("gardenContactName", googleProfileInformation.getAccountGoogleName());
                    gardenAppConfIntent.putExtra("gardenPhone", gardenPhone.getText().toString());
                    gardenAppConfIntent.putExtra("gardenEmail", gardenEmail.getText().toString());
                    startActivity(gardenAppConfIntent);
                    finish();
                }
            }
        });
    }

    private boolean parseGardenInformation() {
        // check that all inputs aren't empty
        if(gardenName.getText().toString().length() == 0) {
            return false;
        }
        if(gardenAddress.getText().toString().length() == 0) {
            return false;
        }
        if(gardenPlots.getText().toString().length() == 0) {
            return false;
        }
        if(gardenPhone.getText().toString().length() == 0) {
            return false;
        }
        if(gardenEmail.getText().toString().length() == 0) {
            return false;
        }
        return true;
    }

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}