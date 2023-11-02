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
import com.plotpals.client.data.Task;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ForumBoardViewTaskActivity extends NavBarActivity {
    final static String TAG = "ForumBoardViewTaskActivity";
    Task task;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forum_board_view_task);

        loadExtras();
        activateNavBar();

        loadTask();
        setButton();
        setText();

        ImageView arrow = findViewById(R.id.forum_board_task_arrow);
        arrow.setOnClickListener(v -> finish());

    }

    private void setText() {
        TextView title = findViewById(R.id.forum_Board_task_Title);
        title.setText(task.getTitle());
        TextView author = findViewById(R.id.forum_board_task_author);
        author.setText(task.getAssigner());
        TextView time = findViewById(R.id.forum_board_task_stamp);
        time.setText(task.getTaskStartTime());
        TextView description = findViewById(R.id.forum_board_task_description);
        description.setText(task.getDescription());
        TextView plot = findViewById(R.id.forum_Board_task_plot_number);
        plot.setText(Integer.toString(task.getPlotId()));
        TextView status = findViewById(R.id.forum_Board_task_status);
        status.setText(task.isCompleted() ? "Complete" : "Incomplete");
        TextView expected = findViewById(R.id.forum_Board_task_expected);
        expected.setText(Integer.toString(task.getExpectedTaskDurationInHours()));
        TextView deadline = findViewById(R.id.forum_Board_task_deadline);
        deadline.setText(task.getDeadlineDate());
        TextView reward = findViewById(R.id.forum_Board_task_reward);
        reward.setText(task.getReward());
        TextView assignee = findViewById(R.id.forum_Board_task_assignee);
        assignee.setText(task.getAssigner());
    }

    private void loadTask() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "";
        Request<?> req = new JsonObjectRequest(
        Request.Method.GET,
        url,
        null,
        (JSONObject response) -> {
            try {
                Log.d(TAG, "Obtaining Task");
                JSONArray fetchedTasks = (JSONArray)response.get("data");
                Log.d(TAG, "Tasks (Should be 1): " + fetchedTasks.length());
                task = new Task(fetchedTasks.getJSONObject(0));
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
        if (!task.isAssigneeIsProvidedFeedback() && task.isCompleted() && task.getAssignerId().equals(googleProfileInformation.getAccountUserId())) { // task is complete and we made it and no feedback
            button.setText("Provide Feedback");
            button.setOnClickListener(view -> {
                Toast.makeText(ForumBoardViewTaskActivity.this, "Provide Feedback Button Pressed", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(ForumBoardViewTaskActivity.this, ForumBoardFeedbackActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
                intent.putExtra("taskTitle", task.getTitle());
                intent.putExtra("taskAssignee", task.getAssigneeName());
                startActivity(intent);
                button.setVisibility(View.GONE);
            });
        } else if (task.isCompleted()) { // task is complete
            button.setVisibility(View.GONE);
        } else if (task.getAssigneeName() == null || task.getAssigneeName().equals("null")) { // nobody is assigned
            button.setText("Volunteer for this task");
            button.setOnClickListener(view -> {
                Toast.makeText(ForumBoardViewTaskActivity.this, "Volunteer Button Pressed", Toast.LENGTH_SHORT).show();
                claimTask();
                button.setVisibility(View.GONE);
            });
        } else if (task.getAssigneeId().equals(googleProfileInformation.getAccountUserId())) { // assignee is you
            button.setText("Mark task as completed");
            button.setOnClickListener(view -> {
                Toast.makeText(ForumBoardViewTaskActivity.this, "Mark task Button Pressed", Toast.LENGTH_SHORT).show();
                completeTask();
                button.setVisibility(View.GONE);
            });

        } else { // task is assigned to someone else
            button.setVisibility(View.GONE);
        }
    }

    private void claimTask() {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        HashMap<String, String> params = new HashMap<>();

        String url = String.format("http://10.0.2.2:8081/posts/tasks/claim?taskId=%s", task.getId());

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.PUT,
                url,
                new JSONObject(params),
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for submitting form: \n"
                                + response.getString("success"));
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

        String url = String.format("http://10.0.2.2:8081/posts/tasks/complete?taskId=%s", task.getId());

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.PUT,
                url,
                new JSONObject(params),
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for submitting form: \n"
                                + response.getString("success"));
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