package com.plotpals.client.data;

import android.content.Intent;

import com.google.android.gms.maps.model.LatLng;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;

/**
 * Garden object that maps to a row of the database table 'gardens'
 */
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

    /* The following are not part of gardens table but can be added to garden object if needed */

    private String gardenOwnerName;

    private RoleEnum roleNumOfCurrentAuthorizedUserInGarden;

    public Garden(JSONObject gardenJsonObject) throws JSONException {
        this.id = gardenJsonObject.getInt("id");
        this.address = gardenJsonObject.getString("address");
        this.location = new LatLng(Double.parseDouble(gardenJsonObject.getString("latitude")), Double.parseDouble(gardenJsonObject.getString("longitude")));
        this.gardenOwnerId = gardenJsonObject.getString("gardenOwnerId");
        this.isApproved = gardenJsonObject.getInt("isApproved") == 1;
        this.contactPhoneNumber = gardenJsonObject.getString("contactPhoneNumber");
        this.contactEmail = gardenJsonObject.getString("contactEmail");
        this.numberOfPlots = gardenJsonObject.getInt("numberOfPlots");
        this.gardenName = gardenJsonObject.getString("gardenName");
        this.gardenOwnerName = gardenJsonObject.optString("gardenOwnerName", null);
        this.roleNumOfCurrentAuthorizedUserInGarden = null;

        int roleNumOfCurrentAuthorizedUserInGardenAsInt = gardenJsonObject.optInt("roleNumOfCurrentAuthorizedUserInGarden", -1);

        if (roleNumOfCurrentAuthorizedUserInGardenAsInt != -1) {
            this.roleNumOfCurrentAuthorizedUserInGarden = RoleEnum.values()[roleNumOfCurrentAuthorizedUserInGardenAsInt];
        }
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
    public boolean isApproved() {
        return isApproved;
    }
    public String getContactPhoneNumber() { return contactPhoneNumber; }
    public String getContactEmail() { return contactEmail; }
    public int getNumberOfPlots() { return numberOfPlots; }
    public String getGardenName() { return gardenName; }

    public String getGardenOwnerName() {
        return gardenOwnerName;
    }

    public RoleEnum getRoleNumOfCurrentAuthorizedUserInGarden() {
        return roleNumOfCurrentAuthorizedUserInGarden;
    }

}
