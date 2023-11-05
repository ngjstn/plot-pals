package com.plotpals.client.ForumBoard;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.NavBarActivity;
import com.plotpals.client.R;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ForumBoardNewPostActivity extends NavBarActivity {
    final static String TAG = "ForumBoardNewPostActivity";
    private EditText titleText;
    private EditText bodyText;
    private Integer currentGardenId;
    private String currentGardenName;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forum_board_new_post);
        loadExtras();
        activateNavBar();

        ImageView x = findViewById(R.id.forum_board_new_post_x);
        x.setOnClickListener(view -> {
            Log.d(TAG, "Clicking X");
            Intent intent = new Intent(ForumBoardNewPostActivity.this, ForumBoardMainActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
        });

        ImageView check = findViewById(R.id.forum_board_new_post_check);
        check.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Check");

            titleText = (EditText)findViewById(R.id.forum_board_new_post_title);
            bodyText = (EditText)findViewById(R.id.forum_board_new_post_body);

            if (titleText.getText().toString().trim().equals("") ||
                    bodyText.getText().toString().trim().equals("")) {
                Toast.makeText(ForumBoardNewPostActivity.this, "Please enter a Title/Body", Toast.LENGTH_SHORT).show();
            } else {
                Intent intent = new Intent(ForumBoardNewPostActivity.this, ForumBoardMainActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
                intent.putExtra("gardenId", currentGardenId);
                intent.putExtra("gardenName", currentGardenName);
                Toast.makeText(ForumBoardNewPostActivity.this, "Post posted (no backend)", Toast.LENGTH_SHORT).show();

                sendPostInformation();

                startActivity(intent);
            }
        });
    }

    private void sendPostInformation() {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        HashMap<String, String> params = new HashMap<>();
        params.put("postTitle", titleText.getText().toString());
        params.put("postDesc", bodyText.getText().toString());

        String url = String.format("https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/posts?gardenId=%s", currentGardenId);

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.POST,
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
            currentGardenId = extras.getInt("gardenId");
            currentGardenName = extras.getString("gardenName");
        }
    }

}