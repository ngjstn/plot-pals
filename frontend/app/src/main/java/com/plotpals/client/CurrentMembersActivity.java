package com.plotpals.client;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.PopupMenu;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Garden;
import com.plotpals.client.data.Plot;
import com.plotpals.client.data.Role;
import com.plotpals.client.data.RoleEnum;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class CurrentMembersActivity extends NavBarActivity {
    final static String TAG = "CurrentMembersActivity";
    ListView plotOwnerListView;
    ArrayList<Role> plotOwnerList;
    ArrayAdapter<Role> plotOwnerAdapter;

    ListView caretakerListView;
    ArrayList<Role> caretakerList;

    ArrayList<Plot> plotsList;
    ArrayAdapter<Role> caretakerAdapter;
    int gardenId;
    Garden currentGarden;

    static GoogleProfileInformation googleProfileInformation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_current_members);
        activateNavBar();
        plotsList = new ArrayList<>();
        plotOwnerList = new ArrayList<>();
        plotOwnerListView = findViewById(R.id.plot_owner_list_view);
        plotOwnerAdapter = new ArrayAdapter<Role>(CurrentMembersActivity.this, R.layout.current_plot_owner_list_view, plotOwnerList)
        {
            @NonNull
            public View getView(int i, View view, ViewGroup viewGroup) {
                LayoutInflater inflater = (LayoutInflater) this.getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                view = inflater.inflate(R.layout.current_plot_owner_list_view, viewGroup, false);

                TextView plotIdentifier = view.findViewById(R.id.plot_id);

                for(int j = 0; j < plotsList.size(); j++) {
                    if(plotsList.get(j).getPlotOwnerId().equals(plotOwnerList.get(i).getProfileId())){
                        int plotIdOfCurrentPlotOwner = plotsList.get(j).getId();
                        plotIdentifier.setText(plotIdOfCurrentPlotOwner+ ":");

                        View horizontalDots = view.findViewById(R.id.more_horiz);
                        horizontalDots.setOnClickListener(horizontalDotsView -> {
                            PopupMenu menu = new PopupMenu(CurrentMembersActivity.this, horizontalDotsView);
                            menu.getMenuInflater().inflate(R.menu.management_menu_for_plotowners, menu.getMenu());
                            menu.setOnMenuItemClickListener(menuItem -> {
                                turnPlotOwnerToCaretaker(plotIdOfCurrentPlotOwner);
                                return true;
                            });

                            menu.show();
                        });
                    }
                }

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
                    menu.getMenuInflater().inflate(R.menu.management_menu_for_caretakers, menu.getMenu());

                    if (plotsList.size() < currentGarden.getNumberOfPlots()) {
                        menu.setOnMenuItemClickListener(menuItem -> {
                            turnCaretakerToPlotOwner(caretakerList.get(i).getProfileId());
                            return true;
                        });
                    }
                    else {
                        menu.setOnMenuItemClickListener(menuItem -> {
                            Toast.makeText(CurrentMembersActivity.this, "No plots available", Toast.LENGTH_SHORT).show();
                            return true;
                        });
                    }
                    menu.show();
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
                    Intent manageActivity = new Intent(CurrentMembersActivity.this, ManageGardenActivity.class);
                    googleProfileInformation.loadGoogleProfileInformationToIntent(manageActivity);
                    manageActivity.putExtra("gardenId", gardenId);
                    startActivity(manageActivity);
            }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        loadExtras();
        requestPlots(gardenId);
        requestGardenInfo(gardenId);
    }

    private void requestPlots(Integer gardenId) {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = String.format("http://10.0.2.2:8081/plots/all?gardenId=%s", gardenId);

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining plots");
                        JSONArray fetchedPlots = (JSONArray)response.get("data");
                        plotsList.clear();
                        /* Populate taskList with fetched task and notify the TaskListView UI to display the fetched task*/
                        if(fetchedPlots.length() > 0) {
                            for (int i = 0; i < fetchedPlots.length(); i++) {
                                Log.d(TAG, fetchedPlots.getJSONObject(i).toString());
                                Plot plot = new Plot(fetchedPlots.getJSONObject(i));
                                plotsList.add(plot);
                            }
                        }
                        requestMembers(gardenId);
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

    private void turnPlotOwnerToCaretaker(int plotId) {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);

        String url = "http://10.0.2.2:8081/plots/" + plotId;
        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.DELETE,
                url,
                null,
                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Response for adding plotOwner: \n" + response.toString());
                        boolean isPlotDeletedSuccessfully = response.getBoolean("success");
                        if (isPlotDeletedSuccessfully) {
                            requestPlots(gardenId);
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

    private void turnCaretakerToPlotOwner(String caretakerId) {

        RequestQueue volleyQueue = Volley.newRequestQueue(this);

        JSONObject jsonRequestBody = new JSONObject();
        try {
            jsonRequestBody.put("gardenId", gardenId);
            jsonRequestBody.put("plotOwnerId", caretakerId);

            String url = "http://10.0.2.2:8081/plots";
            Request<?> jsonObjectRequest = new JsonObjectRequest(
                    Request.Method.POST,
                    url,
                    jsonRequestBody,
                    (JSONObject response) -> {
                        try {
                            Log.d(TAG, "Response for adding plotOwner: \n" + response.toString());
                            boolean isPlotAddedSuccessfully = response.getBoolean("success");
                            if (isPlotAddedSuccessfully) {
                                requestPlots(gardenId);
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
        } catch (JSONException e) {
            Log.d(TAG, e.toString());
        }


    }

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
            gardenId = extras.getInt("gardenId");
        }
    }

}