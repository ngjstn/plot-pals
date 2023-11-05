package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.plotpals.client.utils.GoogleProfileInformation;


public class GardenApplicationActivity extends AppCompatActivity {
    GoogleProfileInformation googleProfileInformation;
    private EditText gardenName;
    private EditText gardenAddress;
    private EditText gardenPlots;
    private EditText gardenPhone;
    private EditText gardenEmail;
    private TextView nameError;
    private TextView addressError;
    private TextView plotsError;
    private TextView phoneError;
    private TextView emailError;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_application);
        loadExtras();
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);

        TextView contactName = findViewById(R.id.garden_contact_name_loaded);
        contactName.setText(googleProfileInformation.getAccountGoogleName());

        gardenName = findViewById(R.id.garden_name_input);
        gardenAddress = findViewById(R.id.garden_address_input);
        gardenPlots = findViewById(R.id.garden_num_plots_input);
        gardenPhone = findViewById(R.id.garden_phone_number_input);
        gardenEmail = findViewById(R.id.garden_email_address_input);

        nameError = findViewById(R.id.garden_name_error);
        addressError = findViewById(R.id.garden_address_error);
        plotsError = findViewById(R.id.garden_num_plots_error);
        phoneError = findViewById(R.id.garden_phone_error);
        emailError = findViewById(R.id.garden_email_error);

        Button nextButton = findViewById(R.id.next_button);
        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent gardenAppConfIntent = new Intent(GardenApplicationActivity.this, GardenApplicationConfirmActivity.class);
                Boolean sendable = parseGardenInformation();
                if (sendable) {
                    gardenAppConfIntent.putExtra("gardenName", gardenName.getText().toString());
                    gardenAppConfIntent.putExtra("gardenAddress", gardenAddress.getText().toString());
                    gardenAppConfIntent.putExtra("gardenPlots", gardenPlots.getText().toString());
                    gardenAppConfIntent.putExtra("gardenContactName", googleProfileInformation.getAccountGoogleName());
                    gardenAppConfIntent.putExtra("gardenPhone", gardenPhone.getText().toString());
                    gardenAppConfIntent.putExtra("gardenEmail", gardenEmail.getText().toString());
                    googleProfileInformation.loadGoogleProfileInformationToIntent(gardenAppConfIntent);
                    startActivity(gardenAppConfIntent);
                    finish();
                }
            }
        });
    }

    private boolean parseGardenInformation() {
        boolean checkStatus = true;

        // reset view states
        nameError.setVisibility(View.GONE);
        addressError.setVisibility(View.GONE);
        plotsError.setVisibility(View.GONE);
        phoneError.setVisibility(View.GONE);
        emailError.setVisibility(View.GONE);

        // check that all inputs aren't empty
        if(gardenName.getText().toString().length() == 0) {
            nameError.setText("Garden name cannot be empty");
            nameError.setVisibility(View.VISIBLE);
            checkStatus = false;
        }
        if(gardenAddress.getText().toString().length() == 0) {
            addressError.setText("Garden address cannot be empty");
            addressError.setVisibility(View.VISIBLE);
            checkStatus = false;
        }
        if(gardenPlots.getText().toString().length() == 0) {
            plotsError.setText("Number of plots cannot be empty");
            plotsError.setVisibility(View.VISIBLE);
            checkStatus = false;
        }
        if(gardenPhone.getText().toString().length() == 0) {
            phoneError.setText("Phone number cannot be empty");
            phoneError.setVisibility(View.VISIBLE);
            checkStatus = false;
        }
        if(gardenEmail.getText().toString().length() == 0) {
            emailError.setText("Email address cannot be empty");
            emailError.setVisibility(View.VISIBLE);
            checkStatus = false;
        }
        return checkStatus;
    }

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}