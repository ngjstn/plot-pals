package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;
import android.widget.TextView;

import com.squareup.picasso.Picasso;

// TODO: Implement database and backend to create and store profile through UI
public class CreateProfilePage extends AppCompatActivity {

    // These are extras that need to be injected prior to starting current activity
    private String accountIdToken;
    private String accountGoogleName;
    private String accountGoogleProfilePictureImageUrl;

    private TextView GoogleLoginNameTextView;

    private ImageView ProfilePictureImageView;

    final static String TAG = "CreateProfilePage";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        loadExtras();
        setContentView(R.layout.activity_create_profile_page);

        GoogleLoginNameTextView = findViewById(R.id.create_profile_page_google_login_name_description_text_view);
        GoogleLoginNameTextView.setText("Logged in as:\n" + accountGoogleName);

        ProfilePictureImageView = findViewById(R.id.create_profile_page_profile_image_view);
        Picasso.get()
                .load(accountGoogleProfilePictureImageUrl)
                .fit()
                .centerCrop()
                .placeholder(R.drawable.default_profile_picture)
                .error(R.drawable.default_profile_picture)
                .into(ProfilePictureImageView);

    }

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            accountIdToken = extras.getString("accountIdToken");
            accountGoogleName = extras.getString("accountGoogleName");
            accountGoogleProfilePictureImageUrl = extras.getString("accountGoogleProfilePictureImageUrl");
        }
    }
}