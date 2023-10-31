package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Garden;
import com.plotpals.client.data.Post;
import com.plotpals.client.data.Task;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class GardenInfoMemberActivity extends AppCompatActivity {
    final static String TAG = "GardenInfoMemberActivity";
    ArrayList<Post> tasksList;
    ListView TasksListView;
    ArrayAdapter<Post> tasksListAdapter;
    static GoogleProfileInformation googleProfileInformation;
    String gardenName;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_info_member);
        loadExtras();

        TasksListView = findViewById(R.id.tasks_list_view);
        tasksList = new ArrayList<Post>();
        tasksListAdapter = new ArrayAdapter<Post>(GardenInfoMemberActivity.this, android.R.layout.simple_list_item_1, tasksList){
            public View getView(int position, View convertView, ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                TextView text1 = view.findViewById(android.R.id.text1);
                text1.setText(tasksList.get(position).getTask().getGardenName() + " - " + tasksList.get(position).getTitle());
                return view;
            }
        };
        TasksListView.setAdapter(tasksListAdapter);

        findViewById(R.id.rectangle_2).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(GardenInfoMemberActivity.this, "Forum Board pressed", Toast.LENGTH_SHORT).show();
            }
        });

        findViewById(R.id.arrow_back_).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(GardenInfoMemberActivity.this, "Back Arrow pressed", Toast.LENGTH_SHORT).show();
                Intent mapsActivity = new Intent(GardenInfoMemberActivity.this, MapsActivity.class);
                startActivity(mapsActivity);
            }
        });

        // TODO: temporary button to test non-member page view

        findViewById(R.id.rectangle_10).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent nonMemberActivity = new Intent(GardenInfoMemberActivity.this, GardenInfoNonMemberActivity.class);
                startActivity(nonMemberActivity);
            }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        requestTasks();
    }

    private void requestTasks() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "http://10.0.2.2:8081/posts/tasks?userIs=assignee";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining task posts");
                        JSONArray fetchedTaskPosts = (JSONArray)response.get("data");
                        if(fetchedTaskPosts.length() > 0) {
                            tasksList.clear();
                            for (int i = 0; i < Math.min(fetchedTaskPosts.length(), 3); i++) {
                                JSONObject taskJsonObject = fetchedTaskPosts.getJSONObject(i);
                                Post taskPost = new Post(taskJsonObject);
                                tasksList.add(taskPost);
                            }

                            tasksListAdapter.notifyDataSetChanged();
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
            googleProfileInformation = new GoogleProfileInformation(
                    extras.getString("accountGoogleName"),
                    extras.getString("accountGoogleProfilePictureImageUrl"),
                    extras.getString("accountUserId"),
                    extras.getString("accountIdToken")
            );

            gardenName = extras.getString("gardenName");
            TextView gardenNameTextView = findViewById(R.id.garden_name);
            gardenNameTextView.setText(gardenName);
        }
    }
}