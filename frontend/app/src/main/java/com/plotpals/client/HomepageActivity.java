package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Update;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class HomepageActivity extends AppCompatActivity {

    final String TAG = "HomepageActivity";

    GoogleProfileInformation googleProfileInformation;

    TextView HomepageTitleTextView;

    ListView UpdatesListView;
    ArrayList<Update> updatesList;

    ArrayAdapter<Update> updatesListAdapter;

    ListView TasksListView;

    ImageView UpdatesForwardArrowImageView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_homepage);
        loadExtras();

        UpdatesForwardArrowImageView = findViewById(R.id.homepage_updates_forward_arrow_image_view);
        UpdatesForwardArrowImageView.setOnClickListener(view -> {
            Intent UpdatesIntent = new Intent(HomepageActivity.this, UpdatesActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(UpdatesIntent);
            startActivity(UpdatesIntent);
        });

        HomepageTitleTextView = findViewById(R.id.homepage_title_text_view);

        UpdatesListView = findViewById(R.id.homepage_updates_list_view);
        updatesList = new ArrayList<Update>();
        updatesListAdapter = new ArrayAdapter<Update>(HomepageActivity.this, android.R.layout.simple_list_item_1, updatesList);
        UpdatesListView.setAdapter(updatesListAdapter);

        TasksListView = findViewById(R.id.homepage_tasks_list_view);
    }
    @Override
    protected void onStart()
    {
        super.onStart();
        requestUpdates();
    }

    private void requestUpdates() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "http://10.0.2.2:8081/updates/";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining updates");
                        JSONArray fetchedUpdates = (JSONArray)response.get("data");
                        if(fetchedUpdates.length() > 0) {
                            updatesList.clear();
                            for (int i = 0; i < Math.min(fetchedUpdates.length(), 3); i++) {
                                JSONObject updateJsonObject = fetchedUpdates.getJSONObject(i);
                                Update update = new Update(updateJsonObject.getInt("id"),
                                        updateJsonObject.getString("userId"),
                                        updateJsonObject.getString("description"),
                                        updateJsonObject.getString("title"));
                                updatesList.add(update);
                            }

                            updatesListAdapter.notifyDataSetChanged();
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