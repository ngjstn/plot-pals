package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class GardenApplicationConfirmActivity extends AppCompatActivity {
    final static String TAG = "GardenApplicationConfActivity";
    GoogleProfileInformation googleProfileInformation;
    private String gardenName;
    private String gardenAddress;
    private String gardenPlots;
    private String gardenPhone;
    private String gardenEmail;

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

        TextView gardenNameDisplay = findViewById(R.id.garden_name_placeholder);
        TextView gardenAddressDisplay = findViewById(R.id.garden_address_placeholder);
        TextView gardenPlotsDisplay = findViewById(R.id.garden_plot_placeholder);
        TextView gardenContactNameDisplay = findViewById(R.id.garden_contact_name_placeholder);
        TextView gardenPhoneDisplay = findViewById(R.id.garden_contact_phone_placeholder);
        TextView gardenEmailDisplay = findViewById(R.id.garden_contact_email_placeholder);

        gardenNameDisplay.setText(gardenName);
        gardenAddressDisplay.setText(gardenAddress);
        gardenPlotsDisplay.setText(gardenPlots);
        gardenPhoneDisplay.setText(gardenPhone);
        gardenEmailDisplay.setText(gardenEmail);
        gardenContactNameDisplay.setText(googleProfileInformation.getAccountGoogleName());

        Button confirmButton = findViewById(R.id.confirm_application_button);
        confirmButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                sendGardenInformation();
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

        String url = "https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/gardens";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.POST,
                url,
                new JSONObject(params),
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for submitting form: \n" + response.getString("success"));
                        // confirmation toast
                        finish();
                    } catch (JSONException e) {
                        Log.d(TAG, e.toString());
                    }
                },
                (VolleyError e) -> {
                    Log.d(TAG, e.toString());
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                HashMap<String, String> headers = new HashMap<>();
                headers.put("Authorization", "Bearer " + googleProfileInformation.getAccountIdToken());
                return headers;
            }
        };

        volleyQueue.add(jsonObjectRequest);

    }
    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}