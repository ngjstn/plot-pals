package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Garden;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class EditGardenActivity extends NavBarActivity {
    final static String TAG = "EditGardenActivity";
    static GoogleProfileInformation googleProfileInformation;
    Integer currentGardenId;
    Garden currentGarden;
    EditText gardenName;
    EditText plotAmount;
    EditText contactNum;
    EditText contactEmail;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_garden);
        loadExtras();
        activateNavBar();

        gardenName = findViewById(R.id.garden_name_temp);
        plotAmount = findViewById(R.id.garden_plot_num);
        contactNum = findViewById(R.id.contact_phone);
        contactEmail = findViewById(R.id.contact_email);

        findViewById(R.id.close_icon).setOnClickListener(view -> finish());

        findViewById(R.id.check_icon).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                requestGardenInfoUpdate();
                Intent resultIntent = new Intent(EditGardenActivity.this, ManageGardenActivity.class);
                setResult(RESULT_OK, resultIntent);
                finish();
            }
        });
    }

    private void updateInputText() {
        gardenName.setText(currentGarden.getGardenName());
        plotAmount.setText(String.valueOf(currentGarden.getNumberOfPlots()));
        contactNum.setText(currentGarden.getContactPhoneNumber());
        contactEmail.setText(currentGarden.getContactEmail());
    }

    private void requestGardenInfoUpdate() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        HashMap<String, String> params = new HashMap<>();

        params.put("contactPhoneNumber", contactNum.getText().toString());
        params.put("contactEmail", contactEmail.getText().toString());
        params.put("numberOfPlots", plotAmount.getText().toString());
        params.put("gardenName", gardenName.getText().toString());

        String url = String.format("http://10.0.2.2:8081/gardens/%s", currentGardenId);

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.PUT,
                url,
                new JSONObject(params),
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for submitting form: \n"
                                + response.getString("success"));
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

    private void requestGardenInfo(Integer gardenId) {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = String.format("http://10.0.2.2:8081/gardens/all?isApproved=true&gardenId=%s", gardenId);

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining garden info");
                        JSONArray fetchedGarden = (JSONArray)response.get("data");
                        JSONObject gardenJson = fetchedGarden.getJSONObject(0);
                        currentGarden = new Garden(gardenJson);
                        updateInputText();
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
            currentGardenId = extras.getInt("gardenId");
            requestGardenInfo(currentGardenId);
        }
    }
}