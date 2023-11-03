package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.graphics.Typeface;
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
import com.plotpals.client.data.Update;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class UpdatesActivity extends AppCompatActivity {

    final String TAG = "UpdatesActivity";

    GoogleProfileInformation googleProfileInformation;

    ListView UpdatesListView;

    ArrayList<Update> updatesList;

    ArrayAdapter<Update> updatesListAdapter;

    ImageView BackArrowImageView;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_updates);
        loadExtras();

        BackArrowImageView = findViewById(R.id.updates_back_arrow_image_view);
        BackArrowImageView.setOnClickListener(view -> {
            getOnBackPressedDispatcher().onBackPressed();
        });

        UpdatesListView = findViewById(R.id.updates_items_list_view);
        updatesList = new ArrayList<Update>();
        updatesListAdapter = new ArrayAdapter (UpdatesActivity.this, android.R.layout.simple_list_item_2, android.R.id.text1, updatesList)
        {
            public View getView(int position, View convertView, ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                TextView text1 = view.findViewById(android.R.id.text1);
                TextView text2 = view.findViewById(android.R.id.text2);
                text1.setText(updatesList.get(position).getTitle());
                text1.setTypeface(null, Typeface.BOLD);
                text2.setText(updatesList.get(position).getDescription() + "\n");

                ViewGroup.LayoutParams params = view.getLayoutParams();
                params.height = ViewGroup.LayoutParams.WRAP_CONTENT;
                view.setLayoutParams(params);
                return view;
            }
        };
        UpdatesListView.setAdapter(updatesListAdapter);
    }

    @Override
    protected void onStart()
    {
        super.onStart();
        requestUpdates();
    }

    private void requestUpdates() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/updates/";

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
                            for (int i = 0; i < fetchedUpdates.length(); i++) {
                                JSONObject updateJsonObject =fetchedUpdates.getJSONObject(i);
                                Update update = new Update(updateJsonObject);
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