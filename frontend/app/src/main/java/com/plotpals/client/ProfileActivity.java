package com.plotpals.client;

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

public class ProfileActivity extends NavBarActivity {
    final static String TAG = "ProfileActivity";
    GoogleProfileInformation googleProfileInformation;
    ImageView AccountProfilePictureImageView;
    TextView AccountProfileNameEditTextView;
    TextView GoogleNameTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);
        loadExtras();
        requestProfileInformation();
        activateNavBar();

        AccountProfileNameEditTextView = findViewById(R.id.account_name_text_view);

        GoogleNameTextView = findViewById(R.id.name);
        GoogleNameTextView.setText(googleProfileInformation.getAccountGoogleName());

        AccountProfilePictureImageView = findViewById(R.id.account_pic_image_view);
        Picasso.get()
                .load(googleProfileInformation.getAccountGoogleProfilePictureImageUrl())
                .fit()
                .centerCrop()
                .placeholder(R.drawable.default_profile_picture)
                .error(R.drawable.default_profile_picture)
                .into(AccountProfilePictureImageView);

        findViewById(R.id.close_icon).setOnClickListener(view -> finish());
//        findViewById(R.id.check_icon).setOnClickListener(view -> finish());
        findViewById(R.id.check_icon).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                sendNameChange(AccountProfileNameEditTextView.getText().toString());
                finish();
            }
        });
    }

    private void requestProfileInformation() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = BuildConfig.API_URL + "/profiles/all?profileId=" + googleProfileInformation.getAccountUserId();

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
                            AccountProfileNameEditTextView.setHint(profile.getDisplayName());
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

    private void sendNameChange(String name) {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        HashMap<String, String> params = new HashMap<>();
        params.put("displayName", name);
        Log.d(TAG, "Sending name change to " + name);

        String url = BuildConfig.API_URL + "/profiles/";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.PUT,
                url,
                new JSONObject(params),
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for submitting form: \n"
                                + response.getString("success"));

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