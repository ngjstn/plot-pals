package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.RatingBar;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.utils.GoogleProfileInformation;
import com.plotpals.client.utils.TaskSocketHandler;

import org.json.JSONException;
import org.json.JSONObject;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

import io.socket.client.Socket;

public class ForumBoardNewTaskActivity extends NavBarActivity {
    final static String TAG = "ForumBoardNewTaskActivity";
    private EditText titleText;
    private EditText bodyText;
    private RatingBar minRatingBar;
    private EditText expectedDaysText;
    private EditText deadlineText;
    private EditText rewardText;
    private Integer currentGardenId;
    private String currentGardenName;

    Socket taskSocket;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forum_board_new_task);
        loadExtras();
        activateNavBar();
        taskSocket = TaskSocketHandler.getSocket();
        taskSocket.connect();

        ImageView x = findViewById(R.id.forum_board_new_task_x);
        x.setOnClickListener(v -> finish());

        ImageView check = findViewById(R.id.forum_board_new_task_check);
        check.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Check");

            titleText = (EditText)findViewById(R.id.forum_board_new_task_title);
            bodyText = (EditText)findViewById(R.id.forum_board_new_task_body);
            minRatingBar = (RatingBar) findViewById(R.id.forum_board_new_task_ratingbar);
            expectedDaysText = (EditText)findViewById(R.id.forum_board_new_task_expected);
            deadlineText = (EditText)findViewById(R.id.forum_board_new_task_deadline);
            rewardText = (EditText)findViewById(R.id.forum_board_new_task_reward);

            try {
                // Check if date is parsable
                LocalDate date = LocalDate.parse( deadlineText.getText().toString(),
                        DateTimeFormatter.ofPattern("MMddyyyy"));

                // Check if date is after today
                if (LocalDate.now().isAfter(date)) {
                    Toast.makeText(ForumBoardNewTaskActivity.this, "Please enter a valid deadline", Toast.LENGTH_SHORT).show();

                    // Check if date is after today
                } else if (expectedDaysText.getText().toString().trim().equals("")) {
                    Toast.makeText(ForumBoardNewTaskActivity.this, "Please enter an expected duration", Toast.LENGTH_SHORT).show();

                        // Check if title & description exist
                } else if (titleText.getText().toString().trim().equals("") ||
                        bodyText.getText().toString().trim().equals("")) {
                    Toast.makeText(ForumBoardNewTaskActivity.this, "Please enter a Title/Body", Toast.LENGTH_SHORT).show();}

                else {
                    Intent intent = new Intent(ForumBoardNewTaskActivity.this, ForumBoardMainActivity.class);
                    googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
                    intent.putExtra("gardenId", currentGardenId);
                    intent.putExtra("gardenName", currentGardenName);
                    Toast.makeText(ForumBoardNewTaskActivity.this, "Task posted (no backend)", Toast.LENGTH_SHORT).show();

                    Log.d(TAG,"------- Posted task -------" +
                            "\nTitle: " + titleText.getText().toString() +
                            "\nDescription: " + bodyText.getText().toString() +
                            "\nMinimum Rating: " + minRatingBar.getRating() +
                            "\nExpected Duration: " + expectedDaysText.getText().toString() +
                            "\nDeadline: " + deadlineText.getText().toString() +
                            "\nReward: " + rewardText.getText().toString());

                    Log.d(TAG, currentGardenName + currentGardenId);

                    sendTaskInformation();

                    startActivity(intent);
                }

            }
            catch (DateTimeParseException e) {
                Toast.makeText(ForumBoardNewTaskActivity.this, deadlineText.getText().toString()+"Please enter a valid deadline", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        taskSocket.close();
    }

    private void sendTaskInformation() {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        HashMap<String, String> params = new HashMap<>();
        params.put("taskTitle", titleText.getText().toString());
        params.put("taskDesc", bodyText.getText().toString());
        params.put("taskRating", String.valueOf(minRatingBar.getRating()));
        params.put("taskDuration", expectedDaysText.getText().toString());
        params.put("taskDeadline", deadlineText.getText().toString());
        params.put("taskReward", rewardText.getText().toString());

        String url = String.format("https://xqx6apo57k.execute-api.us-west-2.amazonaws.com//posts/tasks?gardenId=%s", currentGardenId);

        Request<?> jsonObjectRequest = new JsonObjectRequest(
            Request.Method.POST,
            url,
            new JSONObject(params),
            (JSONObject response) -> {
                try {
                    Log.d(TAG, "Response for submitting form: \n"
                            + response.getString("success"));

                    taskSocket.emit("New Task", currentGardenId);

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
            currentGardenId = extras.getInt("gardenId");
            currentGardenName = extras.getString("gardenName");
        }
    }

}