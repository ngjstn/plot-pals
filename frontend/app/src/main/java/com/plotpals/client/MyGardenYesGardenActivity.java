package com.plotpals.client;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Garden;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.Text;

import java.util.HashMap;
import java.util.Map;

public class MyGardenYesGardenActivity extends NavBarActivity {
    final static String TAG = "MyGardenYesGardenActivity";
    private int upperManagedGardens = 0;
    private int upperGardens = 0;
    GoogleProfileInformation googleProfileInformation;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_garden_yes_garden);
        loadExtras();
        activateNavBar();

        ImageView plusButton = findViewById(R.id.my_garden_plus_button);
        plusButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Google Maps Button");
            Intent mapsIntent = new Intent(MyGardenYesGardenActivity.this, MapsActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(mapsIntent);
            startActivity(mapsIntent);
        });

        loadGardens();
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

    private void loadGardens() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "http://10.0.2.2:8081/gardens";
        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining my gardens");
                        JSONArray fetchedGardens = (JSONArray)response.get("data");
                        Log.d(TAG, "Gardens: " + fetchedGardens.length());

                        // loop and add every garden
                        for (int i = 0; i < fetchedGardens.length(); i++) {
                            JSONObject garden = fetchedGardens.getJSONObject(i);
                            Garden gardenObj = new Garden(garden);
                            Log.d(TAG, "Account User ID: " + googleProfileInformation.getAccountUserId());
                            Log.d(TAG, "Owner User ID: " + gardenObj.getGardenOwnerId());

                            if (googleProfileInformation.getAccountUserId().equals(gardenObj.getGardenOwnerId())) {
                                addManagedGarden(gardenObj);
                                upperManagedGardens++;
                            } else {
                                addGarden(gardenObj);
                                upperGardens++;
                            }
                        }

                        Bundle extras = getIntent().getExtras();
                        assert extras != null;
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

    private void addManagedGarden(Garden garden) {
        // Set view
        RelativeLayout layout = findViewById(R.id.my_garden_scrollview_layout);
        LayoutInflater layoutInflater = (LayoutInflater)
                this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View managedGardenView = layoutInflater.inflate(R.layout.activity_my_garden_managed_garden, layout, false);

        // Translate view downwards based on how many
        defineMargins(managedGardenView, upperManagedGardens, upperGardens);

        // Link buttons
        Button forumButton = managedGardenView.findViewById(R.id.my_garden_managed_forum_button);
        setForumButton(forumButton, 0);
        Button manageButton = managedGardenView.findViewById(R.id.my_garden_managed_manage_button);
        setManageButton(manageButton, garden);
        Button membersButton = managedGardenView.findViewById(R.id.my_garden_managed_members_button);
        setMembersButton(membersButton, garden);

        // Set Garden Name
        TextView textView = managedGardenView.findViewById(R.id.my_garden_managed_name);
        textView.setText(garden.getGardenName());

        layout.addView(managedGardenView);
    }

    private void addGarden(Garden garden) {
        // Set view
        RelativeLayout layout = findViewById(R.id.my_garden_scrollview_layout);
        LayoutInflater layoutInflater = (LayoutInflater)
                this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View gardenView = layoutInflater.inflate(R.layout.activity_my_garden_garden, layout, false);

        // Translate view downwards based on how many
        defineMargins(gardenView, upperManagedGardens, upperGardens);

        // Link buttons
        Button forumButton = gardenView.findViewById(R.id.my_garden_forum_button);
        setForumButton(forumButton, 0);
        Button membersButton = gardenView.findViewById(R.id.my_garden_members_button);
        setMembersButton(membersButton, garden);

        // Set Garden Name
        TextView textView = gardenView.findViewById(R.id.my_garden_name);
        textView.setText(garden.getGardenName());

        layout.addView(gardenView);
    }

    private void defineMargins (View v, int upperManagedGardens, int upperGardens) {
        ViewGroup.MarginLayoutParams margins = (ViewGroup.MarginLayoutParams) v.getLayoutParams();
        margins.setMargins(margins.leftMargin, margins.topMargin + upperManagedGardens * 580 + upperGardens * 470, margins.rightMargin, margins.bottomMargin);
    }

    private void setForumButton(Button forumButton, int id) {
        forumButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Forum Button");
            Intent intent = new Intent(MyGardenYesGardenActivity.this, ForumBoardMainActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            startActivity(intent);
        });
    }

    private void setManageButton(Button manageButton, Garden garden) {
        manageButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Manage Button");
            Intent intent = new Intent(MyGardenYesGardenActivity.this, ManageGardenActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            intent.putExtra("gardenId", garden.getId());
            startActivity(intent);
        });
    }

    private void setMembersButton(Button membersButton, Garden garden) {
        membersButton.setOnClickListener(view -> {
            Log.d(TAG, "Clicking Members Button");
            Intent intent = new Intent(MyGardenYesGardenActivity.this, CurrentMembersActivity.class);
            googleProfileInformation.loadGoogleProfileInformationToIntent(intent);
            intent.putExtra("gardenId", garden.getId());
            intent.putExtra("CameFromMyGardenYes", true);
            startActivity(intent);
        });
    }

}