package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Post;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ForumBoardViewTaskActivity extends NavBarActivity {
    final static String TAG = "ForumBoardViewTaskActivity";
    Post task;
    private int postId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forum_board_view_task);

        loadExtras();
        activateNavBar();

        loadTask();

        ImageView arrow = findViewById(R.id.forum_board_task_arrow);
        arrow.setOnClickListener(view -> finish());

    }

    private void setText() {
        TextView title = findViewById(R.id.forum_Board_task_Title);
        title.setText(task.getTitle());
        TextView author = findViewById(R.id.forum_board_task_author);
        author.setText(task.getAssignerName());
        TextView description = findViewById(R.id.forum_board_task_description);
        description.setText(task.getDescription());
        TextView plot = findViewById(R.id.forum_Board_task_plot_number);
        if(task.getTask().getPlotId() == -1) {
            plot.setText("None");
        } else {
            plot.setText(Integer.toString(task.getTask().getPlotId()));
        }

        TextView status = findViewById(R.id.forum_Board_task_status);
        status.setText(task.getTask().isCompleted() ? "Complete" : "Incomplete");
        TextView expected = findViewById(R.id.forum_Board_task_expected);
        expected.setText(Integer.toString(task.getTask().getExpectedTaskDurationInHours()));
        TextView deadline = findViewById(R.id.forum_Board_task_deadline);
        deadline.setText(task.getTask().getDeadlineDate());
        TextView reward = findViewById(R.id.forum_Board_task_reward);
        reward.setText(task.getTask().getReward());
        TextView assignee = findViewById(R.id.forum_Board_task_assignee);
        assignee.setText(task.getTask().getAssigneeName());
    }

    private void loadTask() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "http://10.0.2.2:8081/posts/all?postId=" + postId;
        Request<?> req = new JsonObjectRequest(
        Request.Method.GET,
        url,
        null,
        (JSONObject response) -> {
            try {
                Log.d(TAG, "Obtaining Task");
                JSONArray fetchedTasks = (JSONArray)response.get("data");
                Log.d(TAG, "Tasks (Should be 1): " + fetchedTasks.length());
                task = new Post(fetchedTasks.getJSONObject(0));
                Log.d(TAG, "Got task assigned to: " + task.getTask().getAssigneeName());
                setButton();
                setText();
                Bundle extras = getIntent().getExtras();
                assert extras != null;
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

        volleyQueue.add(req);
    }

    private void setButton() {
        Button button = findViewById(R.id.forum_board_task_button);
        if (!task.getTask().isAssigneeIsProvidedFeedback() && task.getTask().isCompleted() && task.getAssignerId().equals(googleProfileInformation.getAccountUserId())) { // task is complete and we made it and no feedback
            if (task.getTask().getAssigneeId().equals(task.getAssignerId())) {
                // owner volunteers for their own task, disable feedback button
                button.setVisibility(View.GONE);
            }
            else {
                button.setVisibility(View.VISIBLE);
                button.setText("Provide Feedback");
                button.setOnClickListener(view -> {
                    Toast.makeText(ForumBoardViewTaskActivity.this, "Provide Feedback Button Pressed", Toast.LENGTH_SHORT).show();
                    Intent intent = new Intent(ForumBoardViewTaskActivity.this, ForumBoardFeedbackActivity.class);
                    googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
                    intent.putExtra("taskTitle", task.getTitle());
                    intent.putExtra("taskAssignee", task.getTask().getAssigneeName());
                    intent.putExtra("taskId", task.getTask().getId());
                    intent.putExtra("gardenId", task.getPostGardenId());
                    intent.putExtra("gardenName", task.getGardenName());
                    startActivity(intent);
                    finish();
                });
            }
        } else if (task.getTask().isCompleted() ){  // || task.getAssignerId().equals(googleProfileInformation.getAccountUserId())
            button.setVisibility(View.GONE);
        } else if (task.getTask().getAssigneeName().equals("null")) { // nobody is assigned
            button.setText("Volunteer for this task");
            button.setOnClickListener(view -> {
                Toast.makeText(ForumBoardViewTaskActivity.this, "Volunteer Button Pressed", Toast.LENGTH_SHORT).show();
                claimTask();
            });
        } else if (task.getTask().getAssigneeId().equals(googleProfileInformation.getAccountUserId())) { // assignee is you
            button.setText("Mark task as completed");
            button.setOnClickListener(view -> {
                Toast.makeText(ForumBoardViewTaskActivity.this, "Mark task Button Pressed", Toast.LENGTH_SHORT).show();
                completeTask();
            });

        } else { // task is assigned to someone else
            button.setVisibility(View.GONE);
        }
    }

    private void claimTask() {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        HashMap<String, String> params = new HashMap<>();
        Log.d(TAG, "Claiming Task: " + task.getTask().getId());
        String url = String.format("http://10.0.2.2:8081/posts/tasks/claim?taskId=%s", task.getTask().getId());

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.PUT,
                url,
                new JSONObject(params),
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for submitting form: \n"
                                + response.getString("success"));
                        loadTask();
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

    private void completeTask() {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        HashMap<String, String> params = new HashMap<>();

        String url = String.format("http://10.0.2.2:8081/posts/tasks/complete?taskId=%s", task.getTask().getId());

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.PUT,
                url,
                new JSONObject(params),
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for submitting form: \n"
                                + response.getString("success"));
                        loadTask();
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
            postId = extras.getInt("postId");
        }
    }
}