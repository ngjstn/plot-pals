package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class NavBarActivity extends AppCompatActivity {

    final static String TAG = "NavBarActivity";

    GoogleProfileInformation googleProfileInformation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_nav_bar);
        loadExtras();
    }
    protected void activateNavBar() {
        Button homeButton = findViewById(R.id.button_navbar_home);
        homeButton.setOnClickListener(v -> {
            Log.d(TAG, "Clicking Home Button");
            Intent intent = new Intent(NavBarActivity.this, HomepageActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
        });

        // Can be optimized, but whatever for now.
        Button gardenButton = findViewById(R.id.button_navbar_garden);
        gardenButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking My Garden Button");
            startGardenActivity();
        });

        Button accountButton = findViewById(R.id.button_navbar_account);
        accountButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Account Button");
            Intent intent = new Intent(NavBarActivity.this, AccountMainActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
        });
    }

    /**
     * load extras forwarded from previous activity
     */
    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }

    private void startGardenActivity() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/gardens";
        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining my gardens");
                        JSONArray fetchedGardens = (JSONArray)response.get("data");
                        Log.d(TAG, "Gardens: " + fetchedGardens.length());
                        Intent intent;
                        if (fetchedGardens.length() > 0) {
                            Log.d(TAG, "Have Gardens, opening Garden Page");
                            intent = new Intent(NavBarActivity.this, MyGardenYesGardenActivity.class);
                        } else {
                            Log.d(TAG, "Don't have Gardens, opening Empty Garden Page");
                            intent = new Intent(NavBarActivity.this, MyGardenNoGardenActivity.class);
                        }
                        Bundle extras = getIntent().getExtras();
                        assert extras != null;
                        googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
                        startActivity(intent);
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

}