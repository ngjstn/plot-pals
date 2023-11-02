package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.plotpals.client.utils.GoogleProfileInformation;

public class ForumBoardViewTaskActivity extends NavBarActivity {
    final static String TAG = "ForumBoardViewTaskActivity";
    private String taskTitle;
    private String taskAuthor;
    private String taskTime;
    private String taskDescription;
    private int taskPlotNumber;
    private boolean taskStatus;
    private int taskExpected;
    private String taskDeadline;
    private String taskReward;
    private String taskAssignee;
    private String taskAssigneeId;
    private String taskAssignerId;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forum_board_view_task);

        loadExtras();
        activateNavBar();

        ImageView arrow = findViewById(R.id.forum_board_task_arrow);
        arrow.setOnClickListener(v -> finish());

        TextView title = findViewById(R.id.forum_Board_task_Title);
        title.setText(taskTitle);
        TextView author = findViewById(R.id.forum_board_task_author);
        author.setText(taskAuthor);
        TextView time = findViewById(R.id.forum_board_task_stamp);
        time.setText(taskTime);
        TextView description = findViewById(R.id.forum_board_task_description);
        description.setText(taskDescription);
        TextView plot = findViewById(R.id.forum_Board_task_plot_number);
        plot.setText(Integer.toString(taskPlotNumber));
        TextView status = findViewById(R.id.forum_Board_task_status);
        status.setText(taskStatus ? "Complete" : "Incomplete");
        TextView expected = findViewById(R.id.forum_Board_task_expected);
        expected.setText(Integer.toString(taskExpected));
        TextView deadline = findViewById(R.id.forum_Board_task_deadline);
        deadline.setText(taskDeadline);
        TextView reward = findViewById(R.id.forum_Board_task_reward);
        reward.setText(taskReward);
        TextView assignee = findViewById(R.id.forum_Board_task_assignee);
        assignee.setText(taskAssignee);

        Log.d(TAG, "Assignee Id: " + taskAssigneeId);
        Log.d(TAG, "Google Id: " + googleProfileInformation.getAccountUserId());

        Button button = findViewById(R.id.forum_board_task_button);
        if (taskStatus && taskAssignerId.equals(googleProfileInformation.getAccountUserId())) { // task is complete and we made it
            button.setText("Provide Feedback");
            button.setOnClickListener(view -> {
                Toast.makeText(ForumBoardViewTaskActivity.this, "Provide Feedback Button Pressed", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(ForumBoardViewTaskActivity.this, ForumBoardFeedbackActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
                startActivity(intent);
                button.setVisibility(View.GONE);
            });
        } else if (taskStatus) { // task is complete
            button.setVisibility(View.GONE);
        } else if (taskAssignee == null || taskAssignee.equals("null")) { // nobody is assigned
            button.setText("Volunteer for this task");
            button.setOnClickListener(view -> {
                Toast.makeText(ForumBoardViewTaskActivity.this, "Volunteer Button Pressed", Toast.LENGTH_SHORT).show();
                // set assignee and start time?
                button.setVisibility(View.GONE);
            });
        } else if (taskAssigneeId.equals(googleProfileInformation.getAccountUserId())) { // assignee is you
            button.setText("Mark task as completed");
            button.setOnClickListener(view -> {
                Toast.makeText(ForumBoardViewTaskActivity.this, "Mark task Button Pressed", Toast.LENGTH_SHORT).show();
                // set is completed and end time?
                button.setVisibility(View.GONE);
            });

        } else { // task is assigned to someone else
            button.setVisibility(View.GONE);
        }
    }
    /**
     * load extras forwarded from previous activity
     */
    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
            taskTitle = extras.getString("taskTitle");
            taskAuthor = extras.getString("taskAuthor");
            taskTime = extras.getString("taskTime");
            taskDescription = extras.getString("taskDescription");
            taskPlotNumber = extras.getInt("taskPlotNumber");
            taskStatus = extras.getBoolean("taskStatus");
            taskExpected = extras.getInt("taskExpected");
            taskDeadline = extras.getString("taskDeadline");
            taskReward = extras.getString("taskReward");
            taskAssignee = extras.getString("taskAssignee");
            taskAssigneeId = extras.getString("taskAssigneeId");
            taskAssignerId = extras.getString("taskAssignerId");
        }
    }
}