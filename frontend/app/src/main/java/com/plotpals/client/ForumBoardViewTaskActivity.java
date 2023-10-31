package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;

import com.plotpals.client.utils.GoogleProfileInformation;

public class ForumBoardViewTaskActivity extends NavBarActivity {
    final static String TAG = "ForumBoardViewTaskActivity";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forum_board_view_task);

        loadExtras();
        activateNavBar();

        ImageView arrow = findViewById(R.id.forum_board_task_arrow);
        arrow.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Back Arrow");
            Intent intent = new Intent(ForumBoardViewTaskActivity.this, ForumBoardMainActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
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