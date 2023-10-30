package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import com.plotpals.client.utils.GoogleProfileInformation;

public class ForumBoardNewPostActivity extends NavBarActivity {
    final static String TAG = "ForumBoardNewPostActivity";
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

            EditText titleText = (EditText)findViewById(R.id.forum_board_new_post_title);
            EditText bodyText = (EditText)findViewById(R.id.forum_board_new_post_body);

            if (titleText.getText().toString().trim().equals("") ||
                    bodyText.getText().toString().trim().equals("")) {
                Toast.makeText(ForumBoardNewPostActivity.this, "Please enter a Title/Body", Toast.LENGTH_SHORT).show();
            } else {
                Intent intent = new Intent(ForumBoardNewPostActivity.this, ForumBoardMainActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
                Toast.makeText(ForumBoardNewPostActivity.this, "Post posted (no backend)", Toast.LENGTH_SHORT).show();
                startActivity(intent);
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