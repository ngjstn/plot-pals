package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;
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

            // set is provided feedback to false
            // send rating back for calculation

            finish();

        });

        TextView title = findViewById(R.id.forum_board_feedback_title);
        title.setText(taskTitle);
        TextView name = findViewById(R.id.forum_board_feedback_name);
        name.setText(taskAssignee);
    }

    private void sendFeedback() {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        HashMap<String, String> params = new HashMap<>();

        String url = "";

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
        }
    }
}