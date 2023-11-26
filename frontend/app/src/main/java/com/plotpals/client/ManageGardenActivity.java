package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Garden;
import com.plotpals.client.data.Role;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ManageGardenActivity extends NavBarActivity {
    final static String TAG = "ManageGardenActivity";
    static GoogleProfileInformation googleProfileInformation;
    ArrayList<String> memberNameList;
    ArrayList<Role> memberList;
    ListView memberListView;
    ArrayAdapter<String> memberListAdapter;
    Integer currentGardenId;
    Garden currentGarden;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_manage_garden);
        loadExtras();
        activateNavBar();

        memberNameList = new ArrayList<>();

        memberList = new ArrayList<>();
        memberListView = findViewById(R.id.members_list_view);
        memberListAdapter = new ArrayAdapter<>(ManageGardenActivity.this, android.R.layout.simple_list_item_1, memberNameList);
        memberListView.setAdapter(memberListAdapter);

        findViewById(R.id.arrow_back_).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(ManageGardenActivity.this, "Back Arrow pressed", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(ManageGardenActivity.this, MyGardenYesGardenActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
                startActivity(intent);
            }
        });

        findViewById(R.id.edit_pencil).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(ManageGardenActivity.this, "edit pressed", Toast.LENGTH_SHORT).show();
                Intent editActivity = new Intent(ManageGardenActivity.this, EditGardenActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(editActivity);
                startActivity(editActivity);
            }
        });

        findViewById(R.id.members_forward_arrow).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent currentMemActivity = new Intent(ManageGardenActivity.this, CurrentMembersActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(currentMemActivity);
                currentMemActivity.putExtra("gardenId", currentGardenId);
                startActivity(currentMemActivity);
            }
        });

    }

    @Override
    protected void onStart() {
        super.onStart();
        requestMembers(currentGardenId);
        requestGardenInfo(currentGardenId);
    }

    private void requestMembers(Integer gardenId) {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = String.format("http://10.0.2.2:8081/roles/all?gardenId=%s", gardenId);

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining members");
                        JSONArray fetchedMembers = (JSONArray)response.get("data");

                        /* Populate taskList with fetched task and notify the TaskListView UI to display the fetched task*/
                        if(fetchedMembers.length() > 0) {
                            memberList.clear();
                            memberNameList.clear();
                            for (int i = 0; i < fetchedMembers.length(); i++) {
                                JSONObject roleJsonObject = fetchedMembers.getJSONObject(i);
                                Role role = new Role(roleJsonObject);
                                memberList.add(role);
                                memberNameList.add(role.getGardenMemberName());
                            }
                            memberListAdapter.notifyDataSetChanged();
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
    
    private void requestGardenInfo(Integer gardenId) {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = String.format("http://10.0.2.2:8081/gardens/all?isApproved=true&gardenId=%s", gardenId);

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining garden info");
                        JSONArray fetchedGarden = (JSONArray)response.get("data");
                        JSONObject gardenJson = fetchedGarden.getJSONObject(0);
                        currentGarden = new Garden(gardenJson);
                        updateGardenOverlayContent(currentGarden);

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
            currentGardenId = extras.getInt("gardenId");
        }
    }

    private void updateGardenOverlayContent(Garden garden) {
        TextView address = findViewById(R.id.something_r);
        TextView contactName = findViewById(R.id.contact_nam);
        TextView contactEmail = findViewById(R.id.name_email_);
        TextView contactPhone = findViewById(R.id.some_id);

        address.setText(garden.getAddress());
        contactName.setText(garden.getGardenOwnerName());
        contactEmail.setText(garden.getContactEmail());
        contactPhone.setText(garden.getContactPhoneNumber());
    }
}