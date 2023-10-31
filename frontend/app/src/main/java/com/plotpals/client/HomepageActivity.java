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
import com.plotpals.client.data.Task;
import com.plotpals.client.data.Update;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class HomepageActivity extends NavBarActivity {

    final String TAG = "HomepageActivity";

    GoogleProfileInformation googleProfileInformation;

    TextView HomepageTitleTextView;

    ListView UpdatesListView;
    ArrayList<Update> updatesList;

    ArrayAdapter<Update> updatesListAdapter;

    ListView TasksListView;

    ArrayList<Task> tasksList;

    ArrayAdapter<Task> tasksListAdapter;

    ImageView UpdatesForwardArrowImageView;

    ImageView TasksForwardArrowImageView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_homepage);

        loadExtras();
        activateNavBar();

        UpdatesForwardArrowImageView = findViewById(R.id.homepage_updates_forward_arrow_image_view);
        UpdatesForwardArrowImageView.setOnClickListener(view -> {
            Intent UpdatesIntent = new Intent(HomepageActivity.this, UpdatesActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(UpdatesIntent);
            startActivity(UpdatesIntent);
        });

        TasksForwardArrowImageView = findViewById(R.id.homepage_tasks_forward_arrow_image_view);
        TasksForwardArrowImageView.setOnClickListener(view -> {
            Intent TasksIntent = new Intent(HomepageActivity.this, TasksActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(TasksIntent);
            startActivity(TasksIntent);
        });

        HomepageTitleTextView = findViewById(R.id.homepage_title_text_view);

        UpdatesListView = findViewById(R.id.homepage_updates_list_view);
        updatesList = new ArrayList<Update>();
        updatesListAdapter = new ArrayAdapter<Update>(HomepageActivity.this, android.R.layout.simple_list_item_1, updatesList);
        UpdatesListView.setAdapter(updatesListAdapter);

        TasksListView = findViewById(R.id.homepage_tasks_list_view);
        tasksList = new ArrayList<Task>();
        tasksListAdapter = new ArrayAdapter<Task>(HomepageActivity.this, android.R.layout.simple_list_item_1, tasksList);
        TasksListView.setAdapter(tasksListAdapter);
    }
    @Override
    protected void onStart()
    {
        super.onStart();
        requestUpdates();
        requestTasks();
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

                        /* Populate updateList with fetched updates and notify the UpdatesListView UI to display the fetched update */
                        if(fetchedUpdates.length() > 0) {
                            updatesList.clear();
                            for (int i = 0; i < Math.min(fetchedUpdates.length(), 3); i++) {
                                JSONObject updateJsonObject = fetchedUpdates.getJSONObject(i);
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

    private void requestTasks() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "http://10.0.2.2:8081/tasks?userIs=assignee";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining tasks");
                        JSONArray fetchedTasks = (JSONArray)response.get("data");

                        /* Populate taskList with fetched task and notify the TaskListView UI to display the fetched task */
                        if(fetchedTasks.length() > 0) {
                            tasksList.clear();
                            for (int i = 0; i < Math.min(fetchedTasks.length(), 3); i++) {
                                JSONObject taskJsonObject = fetchedTasks.getJSONObject(i);
                                Task task = new Task(taskJsonObject);
                                tasksList.add(task);
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
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}