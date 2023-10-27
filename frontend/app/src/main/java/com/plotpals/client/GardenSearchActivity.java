package com.plotpals.client;

import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ListView;
import android.widget.SearchView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Objects;

public class GardenSearchActivity extends AppCompatActivity {
    final static String TAG = "GardenSearchActivity";
    private ListView listView;
    ArrayList<String> gardenList = new ArrayList<String>(Arrays.asList("Garden 1", "Garden 2", "Garden 3", "Garden 4", "Garden 5"));
    int[] gardenImages = {R.drawable.image_rec, R.drawable.image_rec, R.drawable.image_rec};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_garden_search);
        findViewById(R.id.no_results_text).setVisibility(View.INVISIBLE);
        findViewById(R.id.try_again_text).setVisibility(View.INVISIBLE);

        listView = (ListView) findViewById(R.id.garden_list);
        gardenBaseAdapter arrayAdapter = new gardenBaseAdapter(getApplicationContext(), gardenList, gardenImages, GardenSearchActivity.this);
        listView.setAdapter(arrayAdapter);

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.garden_search_menu, menu);
        MenuItem menuItem = menu.findItem(R.id.nav_search);
        SearchView searchView = (SearchView) menuItem.getActionView();
        assert searchView != null;
        searchView.setQueryHint("Search for a Garden");

        Bundle extras = getIntent().getExtras();
        String initQuery = extras.getString("initQuery");
        searchGarden(initQuery);

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
        findViewById(R.id.no_results_text).setVisibility(View.INVISIBLE);
        findViewById(R.id.try_again_text).setVisibility(View.INVISIBLE);

        ArrayList<String> gardensSearched = new ArrayList<>();
        for (int i = 0; i < gardenList.size(); i++) {
            if (gardenList.get(i).toLowerCase().contains(query.toLowerCase())) {
                gardensSearched.add(gardenList.get(i));
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
}