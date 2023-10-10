package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.utils.GoogleProfileInformation;
import com.squareup.picasso.Picasso;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class CreateProfileActivity extends AppCompatActivity {

    GoogleProfileInformation googleProfileInformation;

    private TextView GoogleLoginNameTextView;
    private ImageView ProfilePictureImageView;

    private ImageView CheckmarkImageView;

    private EditText DisplayNameEditTextView;

    private TextView ErrorTextView;
    final static String TAG = "CreateProfileActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        loadExtras();

        setContentView(R.layout.activity_create_profile);

        GoogleLoginNameTextView = findViewById(R.id.create_profile_google_login_name_description_text_view);
        GoogleLoginNameTextView.setText("Logged in as:\n" + googleProfileInformation.getAccountGoogleName());

        ProfilePictureImageView = findViewById(R.id.create_profile_profile_picture_image_view);
        Picasso.get()
                .load(googleProfileInformation.getAccountGoogleProfilePictureImageUrl())
                .fit()
                .centerCrop()
                .placeholder(R.drawable.default_profile_picture)
                .error(R.drawable.default_profile_picture)
                .into(ProfilePictureImageView);

        ErrorTextView = findViewById(R.id.create_profile_error_text_view);
        DisplayNameEditTextView= findViewById(R.id.create_profile_display_name_edit_text_view);

        CheckmarkImageView = findViewById(R.id.create_profile_checkmark_image_view);
        CheckmarkImageView.setOnClickListener((view) -> {
            createProfileAndRedirect();
        });
    }

    @Override
    protected void onStart()
    {
        super.onStart();
        skipProfileCreationIfUserProfileAlreadyExists();
    }

    private void createProfileAndRedirect() {
        // check that display name input is not empty
        if(DisplayNameEditTextView.getText().toString().length() == 0) {
            ErrorTextView.setText("Error: display name cannot be empty");
            ErrorTextView.setVisibility(View.VISIBLE);
            return;
        }

        RequestQueue volleyQueue = Volley.newRequestQueue(this);

        HashMap<String, String> params = new HashMap<>();
        params.put("displayName", DisplayNameEditTextView.getText().toString());

        String url = "http://10.0.2.2:8081/profiles";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.POST,
                url,
                new JSONObject(params),
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for profile creation: \n" + response.toString());
                        boolean isProfileCreatedSuccessfully = (boolean)response.get("success");
                        if(isProfileCreatedSuccessfully) {
                            Intent temporaryHomepageIntent = new Intent(CreateProfileActivity.this, TemporaryHomepageActivity.class);
                            googleProfileInformation.loadGoogleProfileInformationToIntent(temporaryHomepageIntent);
                            startActivity(temporaryHomepageIntent);
                        } else {
                            ErrorTextView.setText("Error: profile failed to be created");
                            ErrorTextView.setVisibility(View.VISIBLE);
                        }
                    } catch (JSONException e) {
                        ErrorTextView.setText("Error: profile failed to be created");
                        ErrorTextView.setVisibility(View.VISIBLE);
                        Log.d(TAG, e.toString());
                    }
                },
                (VolleyError e) -> {
                    ErrorTextView.setText("Error: profile failed to be created");
                    ErrorTextView.setVisibility(View.VISIBLE);
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

    // will check if user already has profile and, if they do have a profile, then skip profile creation
    private void skipProfileCreationIfUserProfileAlreadyExists() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "http://10.0.2.2:8081/profiles?profileId=" + googleProfileInformation.getAccountUserId();

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for checking user profile:\n" + response.toString(2));
                        JSONArray fetchedProfile = (JSONArray)response.get("data");
                        if(fetchedProfile.length() > 0) {
                            Intent temporaryHomepageIntent = new Intent(CreateProfileActivity.this, TemporaryHomepageActivity.class);
                            googleProfileInformation.loadGoogleProfileInformationToIntent(temporaryHomepageIntent);
                            startActivity(temporaryHomepageIntent);
                        }
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

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}