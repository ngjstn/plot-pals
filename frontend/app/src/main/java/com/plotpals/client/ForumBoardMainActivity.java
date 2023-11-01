package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Garden;
import com.plotpals.client.data.Task;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ForumBoardMainActivity extends NavBarActivity {

    final static String TAG = "ForumBoardMainActivity";
    private Integer currentGardenId;
    private String currentGardenName = "This should not show up";
    private int upperPosts = 0;

    GoogleProfileInformation googleProfileInformation;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forum_board_main);
        loadExtras();
        activateNavBar();

        TextView newPostText = findViewById(R.id.forum_board_new_post);
        TextView newTaskText = findViewById(R.id.forum_board_new_task);
        newPostText.setVisibility(View.GONE);
        newTaskText.setVisibility(View.GONE);

        Log.d(TAG, "Garden Name:" + currentGardenName);
        TextView name = findViewById(R.id.forum_board_garden_name);
        name.setText(currentGardenName);

        ImageView arrow = findViewById(R.id.forum_board_arrow);
        arrow.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Back Arrow");
            Intent mapsIntent = new Intent(ForumBoardMainActivity.this, MyGardenYesGardenActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(mapsIntent);
            startActivity(mapsIntent);
        });

        ImageView plus = findViewById(R.id.forum_board_plus);
        plus.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Plus Sign");
            // TODO: make invisible when clicked elsewhere
            newPostText.setVisibility(newPostText.getVisibility() == View.VISIBLE ? View.GONE : View.VISIBLE);
            newTaskText.setVisibility(newTaskText.getVisibility() == View.VISIBLE ? View.GONE : View.VISIBLE);
        });

        newPostText.setOnClickListener(view -> {
            Log.d(TAG, "Clicking New Post");
            Intent intent = new Intent(ForumBoardMainActivity.this, ForumBoardNewPostActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
        });

        newTaskText.setOnClickListener(view -> {
            Log.d(TAG, "Clicking New Task");
            Intent intent = new Intent(ForumBoardMainActivity.this, ForumBoardNewTaskActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            intent.putExtra("gardenId", currentGardenId);
            intent.putExtra("gardenName", currentGardenName);
            startActivity(intent);
        });

        loadPosts();
    }

    private void loadPosts() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        Log.d(TAG, "Current Garden: " + currentGardenId);
        String url = "http://10.0.2.2:8081/posts/all?gardenId="+ currentGardenId;
        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining Posts");
                        JSONArray fetchedPosts = (JSONArray)response.get("data");
                        Log.d(TAG, "Posts: " + fetchedPosts.length());

                        // loop and add every garden
                        for (int i = 0; i < fetchedPosts.length(); i++) {
                            // Probably want to check if task or post, but we only do task for now
                            Task task = new Task(fetchedPosts.getJSONObject(i));
                            addTask(task);
                            upperPosts++;
                        }
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
        volleyQueue.add(jsonObjectRequest);
    }

    private void addTask(Task task) {

        RelativeLayout layout = findViewById(R.id.forum_board_scrollview_layout);
        LayoutInflater layoutInflater = (LayoutInflater)
                this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View view = layoutInflater.inflate(R.layout.activity_forum_board_task_preview, layout, false);

        defineMargins(view, upperPosts);

        setPreviewText(view, task);

        setTaskButton(view, task);

        layout.addView(view);

    }

    private void setTaskButton(View view, Task task) {
        TextView title = view.findViewById(R.id.forum_board_task_preview_title);
        title.setOnClickListener(v -> {
            Log.d(TAG, "Clicking Task Title");
            Intent intent = new Intent(ForumBoardMainActivity.this, ForumBoardViewTaskActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
        });
    }

    private void setPreviewText(View view, Task task) {
        TextView title = view.findViewById(R.id.forum_board_task_preview_title);
        title.setText(task.getTitle());
        TextView description = view.findViewById(R.id.forum_board_task_preview_description);
        description.setText(task.getDescription());
        TextView author = view.findViewById(R.id.forum_board_task_preview_author);
        author.setText(task.getAssigner());
        TextView stamp = view.findViewById(R.id.forum_board_task_preview_stamp);
        stamp.setText(task.getTaskStartTime());
    }

    private void defineMargins (View v, int upperPosts) {
        ViewGroup.MarginLayoutParams margins = (ViewGroup.MarginLayoutParams) v.getLayoutParams();
        margins.setMargins(margins.leftMargin, margins.topMargin + upperPosts * 300, margins.rightMargin, margins.bottomMargin);
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