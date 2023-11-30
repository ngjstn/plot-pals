package com.plotpals.client;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
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
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class GardenApplicationsActivity extends NavBarActivity {

    final String TAG = "GardenApplicationsActivity";

    GoogleProfileInformation googleProfileInformation;

    ImageView BackArrowImageView;

    ListView GardenApplicationsListView;
    ArrayList<Garden> gardenApplicationsList;

    ArrayAdapter<Garden> gardenApplicationsListAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_applications);
        loadExtras();
        activateNavBar();

        BackArrowImageView = findViewById(R.id.garden_applications_back_arrow);
        BackArrowImageView.setOnClickListener(view -> {
            getOnBackPressedDispatcher().onBackPressed();
        });

        GardenApplicationsListView = findViewById(R.id.garden_applications_items_list_view);
        gardenApplicationsList = new ArrayList<Garden>();
        gardenApplicationsListAdapter = new ArrayAdapter<Garden>(GardenApplicationsActivity.this, android.R.layout.simple_list_item_1, gardenApplicationsList){

            public View getView(int position, View convertView, ViewGroup parent) {
                LayoutInflater inflater = (LayoutInflater) this.getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                View newView = inflater.inflate(R.layout.activity_single_text_with_forward_arrow_list_view, parent, false);

                TextView listTextView = newView.findViewById(R.id.list_text_view);
                ImageView listImageView = newView.findViewById(R.id.list_forward_arrow);
                listImageView.setOnClickListener(view -> {
                    Intent SingleGardenApplicationIntent = new Intent(GardenApplicationsActivity.this, SingleGardenApplicationActivity.class);
                    googleProfileInformation.loadGoogleProfileInformationToIntent(SingleGardenApplicationIntent);
                    SingleGardenApplicationIntent.putExtra("gardenId", gardenApplicationsList.get(position).getId());
                    startActivity(SingleGardenApplicationIntent);
                });

                listTextView.setText("\"" + gardenApplicationsList.get(position).getGardenName() + "\"" + " [" + gardenApplicationsList.get(position).getId() + "]");
                return newView;
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
                            for(int i = 0; i < fetchedGardens.length(); i++) {
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