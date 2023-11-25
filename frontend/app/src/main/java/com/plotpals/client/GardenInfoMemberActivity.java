package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
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
import com.plotpals.client.data.Plot;
import com.plotpals.client.data.Post;
import com.plotpals.client.data.Role;
import com.plotpals.client.data.RoleEnum;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class GardenInfoMemberActivity extends NavBarActivity {
    final static String TAG = "GardenInfoMemberActivity";
    ArrayList<Post> tasksList;
    ListView TasksListView;
    ArrayAdapter<Post> tasksListAdapter;
    static GoogleProfileInformation googleProfileInformation;
    String gardenName;
    Integer gardenId;
    boolean isPlotOwner = false;
    boolean isGardenOwner = false;
    boolean isCaretaker = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_info_member);
        loadExtras();
        activateNavBar();

        TasksListView = findViewById(R.id.tasks_list_view);
        tasksList = new ArrayList<Post>();
        tasksListAdapter = new ArrayAdapter<Post>(GardenInfoMemberActivity.this, android.R.layout.simple_list_item_1, tasksList){
            public View getView(int position, View convertView, ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                TextView text1 = view.findViewById(android.R.id.text1);
                text1.setText(tasksList.get(position).getGardenName() + " - " + tasksList.get(position).getTitle());
                return view;
            }
        };
        TasksListView.setAdapter(tasksListAdapter);

        findViewById(R.id.rectangle_2).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(GardenInfoMemberActivity.this, "Forum Board pressed", Toast.LENGTH_SHORT).show();
                Intent forumBoard = new Intent(GardenInfoMemberActivity.this, ForumBoardMainActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(forumBoard);
                forumBoard.putExtra("gardenId", gardenId);
                forumBoard.putExtra("gardenName", gardenName);
                startActivity(forumBoard);
            }
        });

        findViewById(R.id.arrow_back_).setOnClickListener(view -> finish());
    }

    @Override
    protected void onStart() {
        super.onStart();
        plotOwnerVisibility(View.GONE);
        caretakerVisibility(View.GONE);
        gardenOwnerVisibility(View.GONE);
        requestTasks();
        requestMembers(gardenId);
        requestPlotOwnerId();
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
                                JSONObject taskJsonObject = fetchedTaskPosts.getJSONObject(i);
                                Post taskPost = new Post(taskJsonObject);
                                if (taskPost.getPostGardenId() == gardenId) {
                                    tasksList.add(taskPost);
                                }
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

    private void requestMembers(Integer gardenId) {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = String.format("http://10.0.2.2:8081/roles/all?gardenId=%s", gardenId);

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining members");
                        JSONArray fetchedMembers = (JSONArray)response.get("data");

                        /* Populate taskList with fetched task and notify the TaskListView UI to display the fetched task*/
                        if(fetchedMembers.length() > 0) {
                            for (int i = 0; i < fetchedMembers.length(); i++) {
                                JSONObject roleJsonObject = fetchedMembers.getJSONObject(i);
                                Role role = new Role(roleJsonObject);
                                if (Objects.equals(role.getProfileId(), googleProfileInformation.getAccountUserId())) {
                                    if (role.getRoleNum() == RoleEnum.PLOT_OWNER) {
                                        isPlotOwner = true;
                                        plotOwnerVisibility(View.VISIBLE);
                                    }
                                    else if (role.getRoleNum() == RoleEnum.CARETAKER) {
                                        isCaretaker = true;
                                        caretakerVisibility(View.VISIBLE);
                                    }
                                    else if (role.getRoleNum() == RoleEnum.GARDEN_OWNER) {
                                        isGardenOwner = true;
                                        plotOwnerVisibility(View.INVISIBLE);
                                        caretakerVisibility(View.INVISIBLE);
                                        gardenOwnerVisibility(View.VISIBLE);
                                    }
                                    break;
                                }
                            }
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


    private void requestPlotOwnerId() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = String.format("http://10.0.2.2:8081/plots/all?plotOwnerId=%s&gardenId=%s", googleProfileInformation.getAccountUserId(), gardenId);

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining plot id");
                        JSONArray fetchedTaskPosts = (JSONArray)response.get("data");
                        if(fetchedTaskPosts.length() > 0) {
                            for (int i = 0; i < fetchedTaskPosts.length(); i++) {
                                JSONObject plotJsonObject = fetchedTaskPosts.getJSONObject(i);
                                Plot plot = new Plot(plotJsonObject);
                                TextView plotidText = findViewById(R.id.plot);
                                plotidText.setText(Integer.toString(plot.getId()));
                            }
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
            gardenId = extras.getInt("gardenId");
            gardenName = extras.getString("gardenName");
            TextView gardenNameTextView = findViewById(R.id.garden_name);
            gardenNameTextView.setText(gardenName);
        }
    }

    private void plotOwnerVisibility(int visible) {
        View button = findViewById(R.id.rectangle_12);
        TextView text = findViewById(R.id.plot_owner);
        button.setVisibility(visible);
        text.setVisibility(visible);
    }

    private void caretakerVisibility(int visible) {
        View button = findViewById(R.id.rectangle_7);
        TextView text = findViewById(R.id.caretaker);
        button.setVisibility(visible);
        text.setVisibility(visible);
    }

    private void gardenOwnerVisibility(int visible) {
        View button = findViewById(R.id.rectangle_11);
        TextView text = findViewById(R.id.garden_owner);
        button.setVisibility(visible);
        text.setVisibility(visible);
    }
}