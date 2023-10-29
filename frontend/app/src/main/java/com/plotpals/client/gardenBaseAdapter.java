package com.plotpals.client;

import static androidx.core.content.ContextCompat.startActivity;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;

public class gardenBaseAdapter extends BaseAdapter {
    final static String TAG = "gardenBaseAdapter";
    Context context;
    ArrayList<String> listGarden;
    String addrList[];
    int listImages[];
    GardenSearchActivity searchActivity;

    public gardenBaseAdapter(Context ctx, ArrayList<String> gardenList, int[] images, GardenSearchActivity activity) {
        this.context = ctx;
        this.listGarden = gardenList;
        this.listImages = images;
        this.searchActivity = activity;
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
        view = inflater.inflate(R.layout.activity_garden_list_view, viewGroup, false);
        TextView txtView = (TextView) view.findViewById(R.id.textView_garden);
        txtView.setText(listGarden.get(i));
//        View gardenImg = view.findViewById(R.id.textView_garden);
//        gardenImg.setBackground(listImages[i]);

        view.findViewById(R.id.rectangle_4).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Log.d(TAG, String.format("View on map pressed for %s", listGarden.get(i)));
                Toast.makeText(context, String.format("View on map pressed for %s", listGarden.get(i)), Toast.LENGTH_SHORT).show();
                Intent mapsIntent = new Intent(searchActivity, MapsActivity.class);
                searchActivity.startActivity(mapsIntent);
            }
        });

        return view;
    }
}
