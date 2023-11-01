package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

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
import org.w3c.dom.Text;

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

        findViewById(R.id.view_forum_).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(GardenInfoNonMemberActivity.this, "View Forum Board pressed", Toast.LENGTH_SHORT).show();
            }
        });

        findViewById(R.id.join).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(GardenInfoNonMemberActivity.this, "Join pressed", Toast.LENGTH_SHORT).show();
            }
        });

//        findViewById(R.id.arrow_back_).setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                Toast.makeText(GardenInfoNonMemberActivity.this, "Back Arrow pressed", Toast.LENGTH_SHORT).show();
//                Intent mapsActivity = new Intent(GardenInfoNonMemberActivity.this, MapsActivity.class);
//                startActivity(mapsActivity);
//            }
//        });
        findViewById(R.id.arrow_back_).setOnClickListener(view -> finish());
    }

    @Override
    protected void onStart() {
        super.onStart();
        requestGardenInfo(gardenId);
    }

    private void requestGardenInfo(Integer gardenId) {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = String.format("http://10.0.2.2:8081/gardens/all?gardenId=%s", gardenId);

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