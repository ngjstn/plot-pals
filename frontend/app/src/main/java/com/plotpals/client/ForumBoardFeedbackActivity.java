package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.ImageView;
import android.widget.RatingBar;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ForumBoardFeedbackActivity extends NavBarActivity {

    private String taskTitle;
    private String taskAssignee;
    private int taskId;

    private String taskGardenName;

    private int taskGardenId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forum_board_feedback);
        loadExtras();
        activateNavBar();

        ImageView x = findViewById(R.id.forum_board_feedback_x);
        x.setOnClickListener(v -> finish());

        ImageView check = findViewById(R.id.forum_board_feedback_check);
        check.setOnClickListener(v -> {

            sendFeedback();
            Intent intent = new Intent(ForumBoardFeedbackActivity.this, ForumBoardMainActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            intent.putExtra("gardenId", taskGardenId);
            intent.putExtra("gardenName", taskGardenName);
            final Handler handler = new Handler(Looper.getMainLooper());
            handler.postDelayed(() -> {
                startActivity(intent);
                finish();
            }, 1000);
        });

        TextView title = findViewById(R.id.forum_board_feedback_title);
        title.setText(taskTitle);
        TextView name = findViewById(R.id.forum_board_feedback_name);
        name.setText(taskAssignee);

    }

    private void sendFeedback() {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        HashMap<String, String> params = new HashMap<>();
        RatingBar ratingBar = findViewById(R.id.forum_board_feedback_ratingbar);
        params.put("newRating", String.valueOf(ratingBar.getRating()));
        params.put("taskId", String.valueOf(taskId));
        Log.d(TAG, "Sending feedback for task ID: " + taskId);

        String url = "http://10.0.2.2:8081/profiles/rating";

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
            taskTitle = extras.getString("taskTitle");
            taskAssignee = extras.getString("taskAssignee");
            taskId = extras.getInt("taskId");
            taskGardenName = extras.getString("gardenName");
            taskGardenId = extras.getInt("gardenId");
        }
    }
}