package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;

import com.plotpals.client.utils.GoogleProfileInformation;

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