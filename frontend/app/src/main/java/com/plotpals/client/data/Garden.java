package com.plotpals.client.data;

import android.content.Intent;

import com.google.android.gms.maps.model.LatLng;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;

public class Garden implements Serializable {
    private int id;
    private String address;
    private LatLng location; 
    private String gardenOwnerId;
    private boolean isApproved;
    private String contactPhoneNumber; 
    private String contactEmail;
    private int numberOfPlots; 
    private String gardenName; 

    public Garden(int id, String address, String longitude, String latitude, String gardenOwnderId, int isApproved, String contactPhoneNumber, String contactEmail, int numberOfPlots, String gardenName) {
        this.id = id;
        this.address = address;
        this.location = new LatLng(Double.parseDouble(latitude), Double.parseDouble(longitude));
        this.gardenOwnerId = gardenOwnderId;
        this.isApproved = isApproved == 1;
        this.contactPhoneNumber = contactPhoneNumber;
        this.contactEmail = contactEmail;
        this.numberOfPlots = numberOfPlots;
        this.gardenName = gardenName;
    }

    public Garden(JSONObject gardenJsonObject) throws JSONException {
        this(gardenJsonObject.getInt("id"),
                gardenJsonObject.getString("address"),
                gardenJsonObject.getString("longitude"),
                gardenJsonObject.getString("latitude"),
                gardenJsonObject.getString("gardenOwnerId"),
                gardenJsonObject.getInt("isApproved"),
                gardenJsonObject.getString("contactPhoneNumber"),
                gardenJsonObject.getString("contactEmail"),
                gardenJsonObject.getInt("numberOfPlots"),
                gardenJsonObject.getString("gardenName")
        );
    }

    public void loadGardenInfoToIntent(Intent intent) {
        intent.putExtra("id", id);
        intent.putExtra("address", address);
        intent.putExtra("longitude", location.longitude);
        intent.putExtra("latitude", location.latitude);
        intent.putExtra("gardenOwnerId", gardenOwnerId);
        intent.putExtra("isApproved", isApproved);
        intent.putExtra("contactPhoneNumber", contactPhoneNumber);
        intent.putExtra("contactEmail", contactEmail);
        intent.putExtra("numberOfPlots", numberOfPlots);
        intent.putExtra("gardenName", gardenName);
    }

    public int getId() { return id; }
    public String getAddress() { return address; }
    public LatLng getLocation() { return location; }
    public String getGardenOwnerId() { return gardenOwnerId; }
    public boolean getIsApproved() { return isApproved; }
    public String getContactPhoneNumber() { return contactPhoneNumber; }
    public String getContactEmail() { return contactEmail; }
    public int getNumberOfPlots() { return numberOfPlots; }
    public String getGardenName() { return gardenName; }

}
