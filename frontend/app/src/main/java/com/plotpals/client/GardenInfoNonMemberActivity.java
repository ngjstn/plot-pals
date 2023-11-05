package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Garden;
import com.plotpals.client.data.RoleEnum;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

public class GardenInfoNonMemberActivity extends AppCompatActivity {
    final static String TAG = "GardenInfoNonMemberActivity";
    Integer gardenId;
    Garden currentGarden;
    GoogleProfileInformation googleProfileInformation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_info_non_member);
        loadExtras();

        findViewById(R.id.join).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(GardenInfoNonMemberActivity.this, "Join pressed", Toast.LENGTH_SHORT).show();
                try {
                    joinGardenRole(RoleEnum.CARETAKER);
                } catch (JSONException e) {
                    Log.d(TAG, "Error joining garden");
                }
            }
        });

        findViewById(R.id.arrow_back_).setOnClickListener(view -> finish());
    }

    @Override
    protected void onStart() {
        super.onStart();
        requestGardenInfo(gardenId);
    }

    private void requestGardenInfo(Integer gardenId) {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = String.format("https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/gardens/all?isApproved=true&gardenId=%s", gardenId);

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
                        updateGardenOverlayContent(currentGarden);

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

    private void joinGardenRole(RoleEnum role) throws JSONException {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/roles";
        JSONObject jsonBody = new JSONObject();
        jsonBody.put("roleNum", role.ordinal());
        jsonBody.put("gardenId", gardenId);
        jsonBody.put("profileId", googleProfileInformation.getAccountUserId());
        final String requestBody = jsonBody.toString();
        StringRequest request = new StringRequest(Request.Method.POST, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d(TAG, String.format("POST joining garden as %s", role.toString()));
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG, error.getMessage());
            }
        }) {
            @Override
            public String getBodyContentType() {
                return "application/json; charset=utf-8";
            }
            @Override
            public byte[] getBody() throws AuthFailureError {
                try {
                    return requestBody == null ? null : requestBody.getBytes("utf-8");
                } catch (UnsupportedEncodingException uee) {
                    VolleyLog.wtf("Unsupported Encoding while trying to get the bytes of %s using %s", requestBody, "utf-8");
                    return null;
                }
            }
            @Override
            public Map<String, String> getHeaders() {
                HashMap<String, String> headers = new HashMap<>();
                headers.put("Authorization", "Bearer " + googleProfileInformation.getAccountIdToken());
                return headers;
            }
        };
        volleyQueue.add(request);
    }

    private void updateGardenOverlayContent(Garden garden) {
        TextView address = findViewById(R.id.something_r);
        TextView contactName = findViewById(R.id.contact_nam);
        TextView contactEmail = findViewById(R.id.name_email_);
        TextView contactPhone = findViewById(R.id.some_id);
        TextView gardenName = findViewById(R.id.garden_name);

        address.setText(garden.getAddress());
        contactName.setText(garden.getGardenOwnerName());
        contactEmail.setText(garden.getContactEmail());
        contactPhone.setText(garden.getContactPhoneNumber());
        gardenName.setText(garden.getGardenName());
    }

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
            gardenId = extras.getInt("gardenId");
        }
    }
}