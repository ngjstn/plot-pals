package com.plotpals.client;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Profile;
import com.plotpals.client.utils.GoogleProfileInformation;
import com.squareup.picasso.Picasso;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class AccountMainActivity extends NavBarActivity {

    final String TAG = "AccountMainActivity";

    GoogleProfileInformation googleProfileInformation;

    ImageView AccountProfilePictureImageView;

    View AccountAdminModeView;

    TextView AccountProfileNameTextView;

    TextView AccountProfileRatingsTextView;

    View AccountProfileActivityView;

    View AccountRatingsActivityView;

    View AccountRolesActivityView;

    private View applyButton;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_account_main);
        loadExtras();

        activateNavBar();

        AccountAdminModeView = findViewById(R.id.account_admin_mode_button);
        AccountAdminModeView.setOnClickListener(view -> {
            Intent AdminHomepageIntent = new Intent(AccountMainActivity.this, AdminHomepageActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(AdminHomepageIntent);
            startActivity(AdminHomepageIntent);
        });

        AccountProfileActivityView = findViewById(R.id.account_profile_button_view);
        AccountProfileActivityView.setOnClickListener(view -> {
            Intent TasksIntent = new Intent(AccountMainActivity.this, ProfileActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(TasksIntent);
            startActivity(TasksIntent);
        });

        AccountRolesActivityView = findViewById(R.id.account_roles_button_view);
        AccountRolesActivityView.setOnClickListener(view -> {
            Intent TasksIntent = new Intent(AccountMainActivity.this, RolesActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(TasksIntent);
            startActivity(TasksIntent);
        });

        findViewById(R.id.rating_button).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent ratingIntent = new Intent(AccountMainActivity.this, RatingExplainActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(ratingIntent);
                startActivity(ratingIntent);
            }
        });

        AccountProfilePictureImageView = findViewById(R.id.account_pic_image_view);
        Picasso.get()
                .load(googleProfileInformation.getAccountGoogleProfilePictureImageUrl())
                .fit()
                .centerCrop()
                .placeholder(R.drawable.default_profile_picture)
                .error(R.drawable.default_profile_picture)
                .into(AccountProfilePictureImageView);

        applyButton = findViewById(R.id.account_apply_button);
        applyButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent gardenAppIntent = new Intent(AccountMainActivity.this, GardenApplicationActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(gardenAppIntent);
                startActivity(gardenAppIntent);
            }
        });

        AccountProfileNameTextView = findViewById(R.id.account_name_text_view);
        AccountProfileRatingsTextView = findViewById(R.id.account_ratings_text_view);
        requestProfileInformation();
    }

    private void requestProfileInformation() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/profiles/all?profileId=" + googleProfileInformation.getAccountUserId();

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining account profile information");
                        JSONArray fetchedProfile = (JSONArray)response.get("data");

                        Log.d(TAG, fetchedProfile.toString());

                        if (fetchedProfile.length() > 0) {
                            /* Use fetched profile information to populate page with relevant account information */
                            Profile profile = new Profile(fetchedProfile.getJSONObject(0));
                            AccountProfileNameTextView.setText(profile.getDisplayName());
                            AccountProfileRatingsTextView.setText(Double.toString(profile.getRating()));
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