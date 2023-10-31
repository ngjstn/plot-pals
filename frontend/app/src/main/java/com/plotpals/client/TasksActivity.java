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
import com.plotpals.client.data.Post;
import com.plotpals.client.data.Task;
import com.plotpals.client.data.Update;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class TasksActivity extends AppCompatActivity {

    final String TAG = "TasksActivity";

    GoogleProfileInformation googleProfileInformation;

    ListView TasksListView;

    ArrayList<Post> tasksList;

    ArrayAdapter<Post> tasksListAdapter;

    ImageView BackArrowImageView;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tasks);
        loadExtras();

        BackArrowImageView = findViewById(R.id.tasks_back_arrow_image_view);
        BackArrowImageView.setOnClickListener(view -> {
            getOnBackPressedDispatcher().onBackPressed();
        });

        TasksListView = findViewById(R.id.tasks_items_list_view);
        tasksList = new ArrayList<Post>();
        tasksListAdapter = new ArrayAdapter (TasksActivity.this, android.R.layout.simple_list_item_2, android.R.id.text1, tasksList)
        {
            public View getView(int position, View convertView, ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                TextView text1 = view.findViewById(android.R.id.text1);
                TextView text2 = view.findViewById(android.R.id.text2);
                text1.setText(tasksList.get(position).getTask().getGardenName() + " - " + tasksList.get(position).getTitle());
                text1.setTypeface(null, Typeface.BOLD);

                if (tasksList.get(position).getTask().isCompleted() == true) {
                    text2.setText("Status: Completed" + "\n");
                } else {
                    text2.setText("Status: In progress" + "\n");
                }

                ViewGroup.LayoutParams params = view.getLayoutParams();
                params.height = ViewGroup.LayoutParams.WRAP_CONTENT;
                view.setLayoutParams(params);
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
                            for (int i = 0; i < fetchedTaskPosts.length(); i++) {
                                JSONObject taskPostJSONObject = fetchedTaskPosts.getJSONObject(i);
                                Post taskPost = new Post(taskPostJSONObject);
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