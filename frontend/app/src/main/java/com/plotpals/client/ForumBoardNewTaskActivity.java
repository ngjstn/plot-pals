package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.NumberPicker;
import android.widget.RatingBar;
import android.widget.Toast;

import com.plotpals.client.utils.GoogleProfileInformation;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class ForumBoardNewTaskActivity extends NavBarActivity {
    final static String TAG = "ForumBoardNewTaskActivity";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forum_board_new_task);
        loadExtras();
        activateNavBar();

        ImageView x = findViewById(R.id.forum_board_new_task_x);
        x.setOnClickListener(view -> {
            Log.d(TAG, "Clicking X");
            Intent intent = new Intent(ForumBoardNewTaskActivity.this, ForumBoardMainActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
        });

        ImageView check = findViewById(R.id.forum_board_new_task_check);
        check.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Check");

            EditText titleText = (EditText)findViewById(R.id.forum_board_new_task_title);
            EditText bodyText = (EditText)findViewById(R.id.forum_board_new_task_body);
            RatingBar minRatingBar = (RatingBar) findViewById(R.id.forum_board_new_task_ratingbar);
            EditText expectedDaysText = (EditText)findViewById(R.id.forum_board_new_task_expected);
            EditText deadlineText = (EditText)findViewById(R.id.forum_board_new_task_deadline);
            EditText rewardText = (EditText)findViewById(R.id.forum_board_new_task_reward);

            try {
                // Check if date is parsable
                LocalDate date = LocalDate.parse( deadlineText.getText().toString(),
                        DateTimeFormatter.ofPattern("MMddyyyy"));

                // Check if date is after today
                if (LocalDate.now().isAfter(date)) {
                    Toast.makeText(ForumBoardNewTaskActivity.this, deadlineText.getText().toString()+"Please enter a valid deadline", Toast.LENGTH_SHORT).show();

                // Check if title & description exist
                } else if (titleText.getText().toString().trim().equals("") ||
                        bodyText.getText().toString().trim().equals("")) {
                    Toast.makeText(ForumBoardNewTaskActivity.this, "Please enter a Title/Body", Toast.LENGTH_SHORT).show();}
                else {
                    Intent intent = new Intent(ForumBoardNewTaskActivity.this, ForumBoardMainActivity.class);
                    googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
//                    Toast.makeText(ForumBoardNewTaskActivity.this, "------- Posted task -------" +
//                            "\nTitle: " + titleText.getText().toString() +
//                            "\nDescription: " + bodyText.getText().toString() +
//                            "\nMinimum Rating: " + minRatingBar.getRating() +
//                            "\nExpected Duration: " + expectedDaysText.getText().toString() +
//                            "\nDeadline: " + deadlineText.getText().toString() +
//                            "\nReward: " + rewardText.getText().toString(), Toast.LENGTH_SHORT).show();

                    startActivity(intent);
                }

            }
            catch (DateTimeParseException e) {
                Toast.makeText(ForumBoardNewTaskActivity.this, deadlineText.getText().toString()+"Please enter a valid deadline", Toast.LENGTH_SHORT).show();
            }
        });
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