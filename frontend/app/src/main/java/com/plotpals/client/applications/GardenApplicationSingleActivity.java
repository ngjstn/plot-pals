package com.plotpals.client.applications;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.R;
import com.plotpals.client.data.Garden;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class GardenApplicationSingleActivity extends AppCompatActivity {

    final String TAG = "SingleGardenApplicationActivity";

    GoogleProfileInformation googleProfileInformation;

    ImageView BackArrowImageView;

    ImageView ApprovalImageView;

    TextView ApplicationTitleTextView;

    TextView AuthorTextView;

    TextView GardenNameTextView;

    TextView AddressTextView;

    TextView NumPlotsTextView;

    TextView ContactNumberTextView;

    TextView ContactEmailTextView;

    int gardenIdForApplication;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_single_garden_application);
        loadExtras();

        BackArrowImageView = findViewById(R.id.single_garden_application_back_arrow_image_view);
        BackArrowImageView.setOnClickListener(view -> {
            getOnBackPressedDispatcher().onBackPressed();
        });

        ApplicationTitleTextView = findViewById(R.id.single_garden_application_title_text_view);
        ApplicationTitleTextView.setText("Application [" + gardenIdForApplication + "]");

        AuthorTextView = findViewById(R.id.single_garden_application_author_text_view);
        GardenNameTextView = findViewById(R.id.single_garden_application_garden_name_text_view);
        AddressTextView = findViewById(R.id.single_garden_application_garden_address_text_view);
        NumPlotsTextView = findViewById(R.id.single_garden_application_number_of_plots_text_view);
        ContactNumberTextView = findViewById(R.id.single_garden_application_phone_number_text_view);
        ContactEmailTextView = findViewById(R.id.single_garden_application_email_text_view);

        ApprovalImageView = findViewById(R.id.single_garden_application_approved_image_view);
        ApprovalImageView.setOnClickListener(view -> {
            approveGardenApplication();
        });
    }

    @Override
    protected void onStart()
    {
        super.onStart();
        requestGardenApplication();
    }

    private void requestGardenApplication() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/gardens/all?isApproved=false&gardenId=" + gardenIdForApplication;

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining gardens");
                        JSONArray fetchedGardenApplicationJson = (JSONArray)response.get("data");

                        if (fetchedGardenApplicationJson.length() > 0) {
                            Garden fetchedGardenApplication = new Garden(fetchedGardenApplicationJson.getJSONObject(0));

                            /* Populate ui with information from garden application */
                            AuthorTextView.setText(fetchedGardenApplication.getGardenOwnerName());
                            AuthorTextView.setVisibility(View.VISIBLE);
                            GardenNameTextView.setText(fetchedGardenApplication.getGardenName());
                            GardenNameTextView.setVisibility(View.VISIBLE);
                            AddressTextView.setText(fetchedGardenApplication.getAddress());
                            AddressTextView.setVisibility(View.VISIBLE);
                            NumPlotsTextView.setText(Integer.toString(fetchedGardenApplication.getNumberOfPlots()));
                            NumPlotsTextView.setVisibility(View.VISIBLE);
                            ContactNumberTextView.setText(fetchedGardenApplication.getContactPhoneNumber());
                            ContactNumberTextView.setVisibility(View.VISIBLE);
                            ContactEmailTextView.setText(fetchedGardenApplication.getContactEmail());
                            ContactEmailTextView.setVisibility(View.VISIBLE);
                        }

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

    private void approveGardenApplication() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);

        HashMap<String, Boolean> params = new HashMap<>();
        params.put("isApproved", true);

        String url = "https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/gardens/" + gardenIdForApplication;

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.PUT,
                url,
                new JSONObject(params),
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for approving application: \n" + response.toString());
                        boolean isGardenApplicationApprovalSuccessful = (boolean)response.get("success");
                        if(isGardenApplicationApprovalSuccessful) {
                            finish();
                        } else {
                            Toast.makeText(GardenApplicationSingleActivity.this, "Failed to approve garden application", Toast.LENGTH_SHORT).show();
                        }
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

    /**
     * load extras forwarded from previous activity
     */
    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
            gardenIdForApplication = extras.getInt("gardenId");
        }
    }
}