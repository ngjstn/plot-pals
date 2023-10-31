package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Garden;
import com.plotpals.client.data.Update;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class AdminHomepageActivity extends AppCompatActivity {

    final String TAG = "AdminHomepageActivity";

    GoogleProfileInformation googleProfileInformation;

    ImageView GardenApplicationsForwardArrow;

    ListView GardenApplicationsListView;
    ArrayList<Garden> gardenApplicationsList;

    ArrayAdapter<Garden> gardenApplicationsListAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_homepage);
        loadExtras();

        GardenApplicationsForwardArrow = findViewById(R.id.admin_homepage_garden_applications_forward_arrow);
        GardenApplicationsForwardArrow.setOnClickListener(view -> {
            Intent GardenApplicationsActivityIntent = new Intent(AdminHomepageActivity.this, GardenApplicationsActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(GardenApplicationsActivityIntent);
            startActivity(GardenApplicationsActivityIntent);
        });

        GardenApplicationsListView = findViewById(R.id.admin_homepage_garden_applications_list_view);
        gardenApplicationsList = new ArrayList<Garden>();
        gardenApplicationsListAdapter = new ArrayAdapter<Garden>(AdminHomepageActivity.this, android.R.layout.simple_list_item_1, gardenApplicationsList){

            public View getView(int position, View convertView, ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                TextView text = (TextView) view.findViewById(android.R.id.text1);
                text.setText("\"" + gardenApplicationsList.get(position).getGardenName() + "\" Application" );
                return view;
            }
        };
        GardenApplicationsListView.setAdapter(gardenApplicationsListAdapter);
    }

    @Override
    protected void onStart()
    {
        super.onStart();
        requestGardenApplications();
    }

    private void requestGardenApplications() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "http://10.0.2.2:8081/gardens/all?isApproved=false";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining gardens");
                        JSONArray fetchedGardens = (JSONArray)response.get("data");

                        /* Populate gardenApplicationsList with fetched and filtered gardens and notify the GardenApplications UI to display the fetched gardenApplications */
                        if(fetchedGardens.length() > 0) {
                            gardenApplicationsList.clear();
                            for(int i = 0; i < Math.min(fetchedGardens.length(), 3); i++) {
                                JSONObject gardenJSONObject = fetchedGardens.getJSONObject(i);
                                Garden garden = new Garden(gardenJSONObject);
                                gardenApplicationsList.add(garden);
                            }
                            gardenApplicationsListAdapter.notifyDataSetChanged();
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
        }
    }
}