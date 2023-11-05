package com.plotpals.client.home;

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
import com.plotpals.client.NavBarActivity;
import com.plotpals.client.R;
import com.plotpals.client.data.Post;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

public class HomePageActivity extends NavBarActivity {

    final String TAG = "HomepageActivity";

    GoogleProfileInformation googleProfileInformation;

    TextView HomepageTitleTextView;

    ListView TasksListView;

    ArrayList<Post> tasksList;

    ArrayAdapter<Post> tasksListAdapter;

    ImageView TasksForwardArrowImageView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_homepage);

        loadExtras();
        activateNavBar();

        TextView username = findViewById(R.id.username);
        username.setText(googleProfileInformation.getAccountGoogleName());

        TasksForwardArrowImageView = findViewById(R.id.homepage_tasks_forward_arrow_image_view);
        TasksForwardArrowImageView.setOnClickListener(view -> {
            Intent TasksIntent = new Intent(HomePageActivity.this, HomePageTasksActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(TasksIntent);
            startActivity(TasksIntent);
        });

        HomepageTitleTextView = findViewById(R.id.homepage_title_text_view);
        Calendar calendar = Calendar.getInstance();
        int hours24hrs = calendar.get(Calendar.HOUR_OF_DAY);
        if (hours24hrs >= 5 && hours24hrs < 12) {
            HomepageTitleTextView.setText(R.string.good_morning_text);
        }
        else if (hours24hrs >= 12 && hours24hrs <= 17) {
            HomepageTitleTextView.setText(R.string.good_afternoon_text);
        }
        else if (hours24hrs > 17 && hours24hrs <= 21) {
            HomepageTitleTextView.setText(R.string.good_evening_text);
        }
        else {
            HomepageTitleTextView.setText(R.string.good_night_text);
        }

        TasksListView = findViewById(R.id.homepage_tasks_list_view);
        tasksList = new ArrayList<Post>();
        tasksListAdapter = new ArrayAdapter<Post>(HomePageActivity.this, android.R.layout.simple_list_item_1, tasksList){
            public View getView(int position, View convertView, ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                TextView text1 = view.findViewById(android.R.id.text1);
                text1.setText(tasksList.get(position).getGardenName() + " - " + tasksList.get(position).getTitle());
                return view;
            }
        };
        TasksListView.setAdapter(tasksListAdapter);
    }
    @Override
    protected void onStart()
    {
        super.onStart();
        requestTasks();
    }

    private void requestTasks() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/posts/tasks?userIs=assignee";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining task posts");
                        JSONArray fetchedTaskPosts = (JSONArray)response.get("data");

                        /* Populate taskList with fetched task and notify the TaskListView UI to display the fetched task*/
                        if(fetchedTaskPosts.length() > 0) {
                            tasksList.clear();
                            for (int i = 0; i < Math.min(fetchedTaskPosts.length(), 3); i++) {
                                JSONObject taskPostJsonObject = fetchedTaskPosts.getJSONObject(i);
                                Post taskPost = new Post(taskPostJsonObject);
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
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}