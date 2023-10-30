package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.utils.GoogleProfileInformation;

import java.util.HashMap;
import java.util.Map;

public class GardenApplicationConfirmActivity extends AppCompatActivity {
    GoogleProfileInformation googleProfileInformation;
    private Button confirmButton;
    private String gardenName;
    private String gardenAddress;
    private String gardenPlots;
    private String gardenContactName;
    private String gardenPhone;
    private String gardenEmail;
    private TextView gardenNameDisplay;
    private TextView gardenAddressDisplay;
    private TextView gardenPlotsDisplay;
    private TextView gardenContactNameDisplay;
    private TextView gardenPhoneDisplay;
    private TextView gardenEmailDisplay;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        loadExtras();
        setContentView(R.layout.activity_garden_application_confirm);

        Bundle applicationExtras = getIntent().getExtras();
        gardenName = applicationExtras.getString("gardenName");
        gardenAddress = applicationExtras.getString("gardenAddress");
        gardenPlots = applicationExtras.getString("gardenPlots");
        gardenPhone = applicationExtras.getString("gardenPhone");
        gardenEmail = applicationExtras.getString("gardenEmail");

        gardenNameDisplay = findViewById(R.id.garden_name_placeholder);
        gardenAddressDisplay = findViewById(R.id.garden_address_placeholder);
        gardenPlotsDisplay = findViewById(R.id.garden_plot_placeholder);
        gardenContactNameDisplay = findViewById(R.id.garden_contact_name_placeholder);
        gardenPhoneDisplay = findViewById(R.id.garden_contact_phone_placeholder);
        gardenEmailDisplay = findViewById(R.id.garden_contact_email_placeholder);

        gardenNameDisplay.setText(gardenName);
        gardenAddressDisplay.setText(gardenAddress);
        gardenPlotsDisplay.setText(gardenPlots);
        gardenPhoneDisplay.setText(gardenPhone);
        gardenEmailDisplay.setText(gardenEmail);
        gardenContactNameDisplay.setText(googleProfileInformation.getAccountGoogleName());

        confirmButton = findViewById(R.id.confirm_application_button);
        confirmButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // sendGardenInformation();
                finish();
            }
        });
    }

    private void sendGardenInformation() {
        // checks should have already happened

        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        HashMap<String, String> params = new HashMap<>();
        params.put("gardenName", gardenName);
        params.put("gardenAddress", gardenAddress);
        params.put("gardenPlots", gardenPlots);
        params.put("gardenPhone", gardenPhone);
        params.put("gardenEmail", gardenEmail);

        String url = "http://10.0.2.2:8081/garden_applications";

        /*
        Request<?> jsonObjectRequest = new JsonObjectRequest(
            Request.Method.POST,
            url,
            // uh
        ) {
            @Override
            public Map<String, String> getHeaders() {
                HashMap<String, String> headers = new HashMap<>();
                headers.put("Authorization", "Bearer " + googleProfileInformation.getAccountIdToken());
                return headers;
        }
         */
    };

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}