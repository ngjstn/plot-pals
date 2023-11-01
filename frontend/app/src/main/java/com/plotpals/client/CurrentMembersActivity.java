package com.plotpals.client;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.PopupMenu;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Garden;
import com.plotpals.client.data.Role;
import com.plotpals.client.data.RoleEnum;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class CurrentMembersActivity extends AppCompatActivity {
    final static String TAG = "CurrentMembersActivity";
    ListView plotOwnerListView;
    ArrayList<Role> plotOwnerList;
    ArrayAdapter<Role> plotOwnerAdapter;

    ListView caretakerListView;
    ArrayList<Role> caretakerList;
    ArrayAdapter<Role> caretakerAdapter;
    int gardenId;
//    boolean cameFromMyGardenYesPage = false;
    
    static GoogleProfileInformation googleProfileInformation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_current_members);

        plotOwnerList = new ArrayList<>();
        plotOwnerListView = findViewById(R.id.plot_owner_list_view);
        plotOwnerAdapter = new ArrayAdapter<Role>(CurrentMembersActivity.this, R.layout.current_plot_owner_list_view, plotOwnerList)
        {
            @NonNull
            public View getView(int i, View view, ViewGroup viewGroup) {
                LayoutInflater inflater = (LayoutInflater) this.getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                view = inflater.inflate(R.layout.current_plot_owner_list_view, viewGroup, false);
                View horizontalDots = view.findViewById(R.id.more_horiz);
                horizontalDots.setVisibility(View.INVISIBLE);
                TextView name = view.findViewById(R.id.name);
                name.setText(plotOwnerList.get(i).getGardenMemberName());

                return view;
            }
        };
        plotOwnerListView.setAdapter(plotOwnerAdapter);

        caretakerList = new ArrayList<>();
        caretakerListView = findViewById(R.id.caretaker_list_view);
        caretakerAdapter = new ArrayAdapter<Role>(CurrentMembersActivity.this, R.layout.current_caretaker_list_view, caretakerList)
        {
            @NonNull
            public View getView(int i, View view, ViewGroup viewGroup) {
                LayoutInflater inflater = (LayoutInflater) this.getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                view = inflater.inflate(R.layout.current_caretaker_list_view, viewGroup, false);

                View horizontalDots = view.findViewById(R.id.more_horiz);
                horizontalDots.setOnClickListener(horizontalDotsView -> {
                    PopupMenu menu = new PopupMenu(CurrentMembersActivity.this, horizontalDotsView);

                    menu.getMenuInflater().inflate(R.menu.member_management_menu, menu.getMenu());
                    menu.setOnMenuItemClickListener(menuItem -> {
                        // Toast message on menu item clicked
                        Toast.makeText(CurrentMembersActivity.this, "You Clicked " + menuItem.getTitle(), Toast.LENGTH_SHORT).show();
                        return true;
                    });
                });

                TextView name = view.findViewById(R.id.name);
                name.setText(caretakerList.get(i).getGardenMemberName());

                return view;
            }
        };
        caretakerListView.setAdapter(caretakerAdapter);

        findViewById(R.id.arrow_back_).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
//                if (cameFromMyGardenYesPage) {
//                    Intent myGardenYes = new Intent(CurrentMembersActivity.this, MyGardenYesGardenActivity.class);
//                    googleProfileInformation.loadGoogleProfileInformationToIntent(myGardenYes);
//                    startActivity(myGardenYes);
//                }
//                else {
                    Intent manageActivity = new Intent(CurrentMembersActivity.this, ManageGardenActivity.class);
                    googleProfileInformation.loadGoogleProfileInformationToIntent(manageActivity);
                    manageActivity.putExtra("gardenId", gardenId);
                    startActivity(manageActivity);
//                }
            }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        loadExtras();
        requestMembers(gardenId);
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
                            plotOwnerList.clear();
                            caretakerList.clear();
                            for (int i = 0; i < fetchedMembers.length(); i++) {
                                JSONObject roleJsonObject = fetchedMembers.getJSONObject(i);
                                Role role = new Role(roleJsonObject);

                                if (role.getRoleNum() == RoleEnum.PLOT_OWNER) {
                                    plotOwnerList.add(role);
                                } 
                                else if (role.getRoleNum() == RoleEnum.CARETAKER) {
                                    caretakerList.add(role);
                                }
                                else if (role.getRoleNum() == RoleEnum.GARDEN_OWNER) {
                                    TextView ownerName = findViewById(R.id.garden_owner_name);
                                    ownerName.setText(role.getGardenMemberName());
                                }
                            }
                            plotOwnerAdapter.notifyDataSetChanged();
                            caretakerAdapter.notifyDataSetChanged();
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
            gardenId = extras.getInt("gardenId");
//            cameFromMyGardenYesPage = extras.getBoolean("CameFromMyGardenYes");
        }
    }

}