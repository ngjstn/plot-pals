package com.plotpals.client.utils;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;
import android.widget.Toast;

import com.plotpals.client.GardenSearchActivity;
import com.plotpals.client.MapsActivity;
import com.plotpals.client.R;
import com.plotpals.client.data.Garden;

import java.util.List;

public class GardenBaseAdapter extends BaseAdapter {
    final static String TAG = "GardenBaseAdapter";
    Context context;
    List<Garden> listGarden;
    int listImages[];
    GardenSearchActivity searchActivity;
    GoogleProfileInformation googleProfileInformation;

    public GardenBaseAdapter(Context ctx, List<Garden> garden, int[] images, GardenSearchActivity activity, GoogleProfileInformation googleProfileInformation) {
        this.context = ctx;
        this.listGarden = garden;
        this.listImages = images;
        this.searchActivity = activity;
        this.googleProfileInformation = googleProfileInformation;
    }
    @Override
    public int getCount() {
        return listGarden.size();
    }

    @Override
    public Object getItem(int i) {
        return null;
    }

    @Override
    public long getItemId(int i) {
        return 0;
    }


    @Override
    public View getView(int i, View view, ViewGroup viewGroup) {
        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View newView = inflater.inflate(R.layout.activity_garden_list_view, viewGroup, false);

        TextView gardenName = (TextView) newView.findViewById(R.id.textView_garden);
        gardenName.setText(listGarden.get(i).getGardenName());

        TextView address = (TextView) newView.findViewById(R.id.textView3);
        address.setText(listGarden.get(i).getAddress());

//        View gardenImg = view.findViewById(R.id.textView_garden);
//        gardenImg.setBackground(listImages[i]);

        newView.findViewById(R.id.rectangle_4).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Log.d(TAG, String.format("View on map pressed for %s", listGarden.get(i).getGardenName()));
                Toast.makeText(context, String.format("View on map pressed for %s", listGarden.get(i).getGardenName()), Toast.LENGTH_SHORT).show();
                Intent mapsIntent = new Intent(searchActivity, MapsActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(mapsIntent);
                mapsIntent.putExtra("moveToSelectedLat", listGarden.get(i).getLocation().latitude);
                mapsIntent.putExtra("moveToSelectedLong", listGarden.get(i).getLocation().longitude);
                searchActivity.startActivity(mapsIntent);
                searchActivity.finish();
            }
        });

        return newView;
    }
}