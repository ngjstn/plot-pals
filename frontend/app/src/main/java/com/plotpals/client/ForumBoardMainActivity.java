package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.plotpals.client.utils.GoogleProfileInformation;

public class ForumBoardMainActivity extends NavBarActivity {

    final static String TAG = "ForumBoardMainActivity";
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
            newPostText.setVisibility(View.VISIBLE);
            newTaskText.setVisibility(View.VISIBLE);
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