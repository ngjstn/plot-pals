package com.plotpals.client;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.SignInButton;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class AppEntryActivity extends AppCompatActivity {

    SignInButton signInButton;

    GoogleProfileInformation googleProfileInformation;

    private GoogleSignInClient mGoogleSignInClient;

    private ActivityResultLauncher<Intent> googleSignInActivityResultLauncher;

    final static String TAG = "AppEntryActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_app_entry);

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.server_client_id))
                .requestEmail()
                .requestProfile()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        googleSignInActivityResultLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK) {
                        Intent data = result.getData();
                        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
                        handleSignInResult(task);
                    }
                });

        signInButton = findViewById(R.id.sign_in_button);
        signInButton.setOnClickListener((view) -> {
            Log.d(TAG, "Clicking Google Sign-in button");
            signIn();
        });
    }

    @Override
    protected void onStart()
    {
        super.onStart();
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        updateUI(account);
    }

    private void signIn() {
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        googleSignInActivityResultLauncher.launch(signInIntent);
    }

    private void updateUI(GoogleSignInAccount account) {
        if(account == null || account.isExpired()) {
            return;
        }

        String accountGoogleName = account.getDisplayName();
        String accountGoogleProfilePictureImageUrl = account.getPhotoUrl().toString();
        String accountIdToken = account.getIdToken();
        String accountUserId = account.getId();

        Handler handler = new Handler();
        handler.postDelayed(() -> {
            Log.d(TAG, "Account google name: " + accountGoogleName);
            Log.d(TAG, "Account id token: " + accountIdToken);

            // test api call (DELETE LATER)
            testIdTokenBackendRequest(accountIdToken);

            googleProfileInformation = new GoogleProfileInformation(accountGoogleName
                    , accountGoogleProfilePictureImageUrl, accountUserId, accountIdToken);
            redirectToProfileCreationOrSkipIt();

        }, 1000);
    }

    // if user already has a profile, then we skip profile creation and head to the activity after it
    private void redirectToProfileCreationOrSkipIt() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        Log.d(TAG, "Account userid: " + googleProfileInformation.getAccountUserId());
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
                            Intent temporaryHomepageIntent = new Intent(AppEntryActivity.this, TemporaryHomepageActivity.class);
                            googleProfileInformation.loadGoogleProfileInformationToIntent(temporaryHomepageIntent);
                            startActivity(temporaryHomepageIntent);
                        } else {
                            Intent createProfileIntent = new Intent(AppEntryActivity.this, CreateProfileActivity.class);
                            googleProfileInformation.loadGoogleProfileInformationToIntent(createProfileIntent);
                            startActivity(createProfileIntent);
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

    // to test if google id token can be processed in the backend correctly (DELETE FUNCTION LATER)
    private void testIdTokenBackendRequest(String accountIdToken) {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);

        String url = "http://10.0.2.2:8081/";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Test message from backend" + response.get("message"));
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
                headers.put("Authorization", "Bearer " + accountIdToken);
                return headers;
            }
        };

        volleyQueue.add(jsonObjectRequest);
    }

    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);
            updateUI(account);
        } catch (ApiException e) {
            Log.w(TAG, "Sign in failed. Code=" + e.getStatusCode());
        }
    }
}