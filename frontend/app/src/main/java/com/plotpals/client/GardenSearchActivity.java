package com.plotpals.client;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ListView;
import android.widget.SearchView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.data.Garden;
import com.plotpals.client.utils.GoogleProfileInformation;
import com.plotpals.client.utils.gardenBaseAdapter;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GardenSearchActivity extends AppCompatActivity {
    final static String TAG = "GardenSearchActivity";
    private ListView listView;
//    ArrayList<String> gardenList = new ArrayList<String>(Arrays.asList("Garden 1", "Garden 2", "Garden 3", "Garden 4", "Garden 5"));
    private List<Garden> gardenObjectList = new ArrayList<>();
    int[] gardenImages = {R.drawable.image_rec, R.drawable.image_rec, R.drawable.image_rec, R.drawable.image_rec, R.drawable.image_rec};
    static GoogleProfileInformation googleProfileInformation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_search);
        findViewById(R.id.no_results_text).setVisibility(View.GONE);
        findViewById(R.id.try_again_text).setVisibility(View.GONE);
        loadProfileInfo();
        requestGardens();
        listView = (ListView) findViewById(R.id.garden_list);
        gardenBaseAdapter arrayAdapter = new gardenBaseAdapter(getApplicationContext(), gardenObjectList, gardenImages, GardenSearchActivity.this);
        listView.setAdapter(arrayAdapter);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.garden_search_menu, menu);
        MenuItem menuItem = menu.findItem(R.id.nav_search);
        SearchView searchView = (SearchView) menuItem.getActionView();
        assert searchView != null;
        searchView.setQueryHint("Search for a Garden");

        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String s) {
                return false;
            }

            @Override
            public boolean onQueryTextChange(String s) {
                searchGarden(s);
                return false;
            }
        });
        return super.onCreateOptionsMenu(menu);
    }

    private void searchGarden(String query) {
        findViewById(R.id.no_results_text).setVisibility(View.GONE);
        findViewById(R.id.try_again_text).setVisibility(View.GONE);

        List<Garden> gardensSearched = new ArrayList<>();
        for (int i = 0; i < gardenObjectList.size(); i++) {
            if (gardenObjectList.get(i).getGardenName().toLowerCase().contains(query.toLowerCase())) {
                gardensSearched.add(gardenObjectList.get(i));
            }
        }

        if (gardensSearched.size() == 0)
        {
            findViewById(R.id.no_results_text).setVisibility(View.VISIBLE);
            findViewById(R.id.try_again_text).setVisibility(View.VISIBLE);
        }

        gardenBaseAdapter arrayAdapter = new gardenBaseAdapter(getApplicationContext(), gardensSearched, gardenImages, GardenSearchActivity.this);
        listView.setAdapter(arrayAdapter);
    }

    private void requestGardens() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "http://10.0.2.2:8081/gardens/all";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
            Request.Method.GET,
            url,
            null,
            (JSONObject response) -> {
                try {
                    Log.d(TAG, "Obtaining gardens");
                    JSONArray fetchedGardens = (JSONArray)response.get("data");
                    if (fetchedGardens.length() > 0) {
                        gardenObjectList.clear();
                        for (int i =0; i < fetchedGardens.length(); i++) {
                            JSONObject updateGardenObject = fetchedGardens.getJSONObject(i);
                            Garden garden = new Garden(updateGardenObject);
                            gardenObjectList.add(garden);
                        }
                        Bundle extras = getIntent().getExtras();
                        assert extras != null;
                        String initQuery = extras.getString("initQuery");
                        searchGarden(initQuery);
//                        gardenBaseAdapter arrayAdapter = new gardenBaseAdapter(getApplicationContext(), gardenObjectList, gardenImages, GardenSearchActivity.this);
//                        listView.setAdapter(arrayAdapter);
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

    private void loadProfileInfo() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}