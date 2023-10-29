package com.plotpals.client;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.res.ResourcesCompat;
import androidx.fragment.app.FragmentActivity;
import androidx.fragment.app.FragmentManager;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Camera;
import android.graphics.Canvas;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ListAdapter;
import android.widget.ListView;
import android.widget.SearchView;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MapStyleOptions;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.plotpals.client.data.Garden;
import com.plotpals.client.databinding.ActivityMapsBinding;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.Text;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

public class MapsActivity extends FragmentActivity implements OnMapReadyCallback, LocationListener, GoogleMap.OnMarkerClickListener {

    final static String TAG = "MapsActivity";
    public static GoogleMap mMap;
    private ActivityMapsBinding binding;
    private Marker mapsMarker;
    public static String locationCityName;
    public static double locationLat = 0, locationLong = 0;
    private Integer locationPollRate_ms = 1000;
    private SearchView gardenSearchView;
    static GoogleProfileInformation googleProfileInformation;
    private List<Garden> gardenList = new ArrayList<>();
    private HashMap<Marker, Garden> gardenMarkerMap = new HashMap<>();
    private Garden currentGardenSelected;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        checkLocationPermission();
        loadExtras();

        binding = ActivityMapsBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        assert mapFragment != null;
        mapFragment.getMapAsync(this);
        gardenOverlayVisiblility(View.GONE);

        gardenSearchView = findViewById(R.id.search_garden);
        gardenSearchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String s) {
                Intent gardenSearchIntent = new Intent(MapsActivity.this, GardenSearchActivity.class);
                gardenSearchIntent.putExtra("initQuery", s);
                googleProfileInformation.loadGoogleProfileInformationToIntent(gardenSearchIntent);
                startActivity(gardenSearchIntent);
                return false;
            }

            @Override
            public boolean onQueryTextChange(String s) {
                return false;
            }
        });

        findViewById(R.id.rectangle_2).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Log.d(TAG, "Forum board button pressed");
                Toast.makeText(MapsActivity.this, "View Forum Board pressed", Toast.LENGTH_SHORT).show();
            }
        });

        findViewById(R.id.rectangle_3).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Log.d(TAG, "More Info/Join button pressed");
                Toast.makeText(MapsActivity.this, "More Info/Join pressed", Toast.LENGTH_SHORT).show();

                // TODO: intent should be conditional on being a member or non-member. For now, it's default member view.
                Intent gardenInfo = new Intent(MapsActivity.this, GardenInfoMemberActivity.class);
                googleProfileInformation.loadGoogleProfileInformationToIntent(gardenInfo);
                gardenInfo.putExtra("gardenName", currentGardenSelected.getGardenName());
                startActivity(gardenInfo);
            }
        });

    }

    /**
     * Manipulates the map once available.
     * This callback is triggered when the map is ready to be used.
     * This is where we can add markers or lines, add listeners or move the camera. In this case,
     * we just add a marker near Sydney, Australia.
     * If Google Play services is not installed on the device, the user will be prompted to install
     * it inside the SupportMapFragment. This method will only be triggered once the user has
     * installed Google Play services and returned to the app.
     */
    @Override
    public void onMapReady(GoogleMap googleMap) {
        // update the location view on map
        mMap = googleMap;
        mMap.clear();

        try {
            // Customise the styling of the base map using a JSON object defined
            // in a raw resource file.
            boolean success = googleMap.setMapStyle(
                    MapStyleOptions.loadRawResourceStyle(
                            this, R.raw.style_json));

            if (!success) {
                Log.e(TAG, "Style parsing failed.");
            }
        } catch (Resources.NotFoundException e) {
            Log.e(TAG, "Can't find style. Error: ", e);
        }
        LatLng currentLocation = new LatLng(locationLat, locationLong);
        drawCurrentLocationMarker();
        requestGardens();
//        mapsMarker = mMap.addMarker(new MarkerOptions().position(currentLocation).title(String.format("Marker in %s", locationCityName)));
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(currentLocation, 15));

        googleMap.setOnMarkerClickListener(this);

        mMap.setOnMapClickListener(new GoogleMap.OnMapClickListener() {
            @Override
            public void onMapClick(@NonNull LatLng latLng) {
                gardenOverlayVisiblility(View.GONE);
            }
        });
    }

    @Override
    public void onLocationChanged(@NonNull Location location) {
        // on first entry, map structures likely haven't been initialized yet
        if (mapsMarker == null || mMap == null) {
            // do nothing
            return;
        }

        locationLat = location.getLatitude();
        locationLong = location.getLongitude();

        // parse for city name using current location
//        Geocoder geocoder = new Geocoder(this, Locale.getDefault());
//        try {
//            List<Address> addresses = geocoder.getFromLocation(location.getLatitude(), location.getLongitude(), 1);
//            locationCityName = addresses.get(0).getLocality();
//            Log.d(TAG, String.format("Current City: %s, Lat: %f, Long: %f", locationCityName, locationLat, locationLong));
//        } catch (IOException e) {
//            Log.d(TAG, String.format("Can't find Geocoder locality: %f", e));
//            //            throw new RuntimeException(e);
//        }

        Log.d(TAG, String.format("Lat: %f, Long: %f", locationLat, locationLong));
        LatLng currentLocation = new LatLng(locationLat, locationLong);
        // marker is stuck on default location (0,0); move to current location
        if (mapsMarker.getPosition().equals(new LatLng(0, 0))) {
            mMap.moveCamera(CameraUpdateFactory.newLatLng(currentLocation));
        }
        mapsMarker.setPosition(currentLocation);
//        mapsMarker.setTitle(String.format("Marker in %s", locationCityName));
    }


    private void checkLocationPermission() {
        if ((ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED)
                && (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED)) {
            // already have perms, do nothing
            Log.d(TAG, "Location permissions already enabled");
            requestLocationUpdates();
            return;
        } else {
            // at least one of the permissions was denied
            if (ActivityCompat.shouldShowRequestPermissionRationale(this, android.Manifest.permission.ACCESS_COARSE_LOCATION)
                    || ActivityCompat.shouldShowRequestPermissionRationale(this, android.Manifest.permission.ACCESS_FINE_LOCATION)) {
                Toast.makeText(MapsActivity.this, "We need these location permissions for phone details", Toast.LENGTH_LONG).show();
                new AlertDialog.Builder(this)
                        .setTitle("Need Location Permissions")
                        .setMessage("We need the location permissions to update current city phone details")
                        .setNegativeButton("CANCEL", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                Toast.makeText(MapsActivity.this, "We need these location permissions to run", Toast.LENGTH_LONG).show();
                                dialogInterface.dismiss();
                            }
                        })
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                ActivityCompat.requestPermissions(MapsActivity.this, new String[]{android.Manifest.permission.ACCESS_COARSE_LOCATION, android.Manifest.permission.ACCESS_FINE_LOCATION}, 1);
                            }
                        })
                        .create()
                        .show();
            }
            // permissions were never requested
            else {
                Toast.makeText(MapsActivity.this, "Requesting location permissions", Toast.LENGTH_LONG).show();
                ActivityCompat.requestPermissions(MapsActivity.this, new String[]{android.Manifest.permission.ACCESS_COARSE_LOCATION, android.Manifest.permission.ACCESS_FINE_LOCATION}, 1);
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        requestLocationUpdates();
    }

    private void requestLocationUpdates() {
        // only call location manager APIs in this permission request callback to handle async behavior
        LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.

            return;
        }
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, locationPollRate_ms, 0, this);
    }

    @Override
    public boolean onMarkerClick(@NonNull Marker marker) {
        // clicking the current location marker shouldn't update the overlay
        if (marker.equals(mapsMarker))
        {
            gardenOverlayVisiblility(View.GONE);
            return false;
        }
        Garden garden = gardenMarkerMap.get(marker);
        assert garden != null;
        currentGardenSelected = garden;
        updateGardenOverlayContent(garden);
        gardenOverlayVisiblility(View.VISIBLE);
        return false;
    }

    private void gardenOverlayVisiblility(int visible) {
        findViewById(R.id.shadow_rectangle_1).setVisibility(visible);
        findViewById(R.id.rectangle_1).setVisibility(visible);
        findViewById(R.id.image_rec).setVisibility(visible);
        findViewById(R.id.rectangle_2).setVisibility(visible);
        findViewById(R.id.rectangle_3).setVisibility(visible);
        findViewById(R.id.garden_name).setVisibility(visible);
        findViewById(R.id.address).setVisibility(visible);
        findViewById(R.id.something_r).setVisibility(visible);
        findViewById(R.id.contact_inf).setVisibility(visible);
        findViewById(R.id.person).setVisibility(visible);
        findViewById(R.id.call).setVisibility(visible);
        findViewById(R.id.mail).setVisibility(visible);
        findViewById(R.id.contact_nam).setVisibility(visible);
        findViewById(R.id.some_id).setVisibility(visible);
        findViewById(R.id.name_email_).setVisibility(visible);
        findViewById(R.id.view_forum_).setVisibility(visible);
        findViewById(R.id.more_info_j).setVisibility(visible);
    }

    private void updateGardenOverlayContent(Garden garden) {
        TextView gardenName = findViewById(R.id.garden_name);
        TextView address = findViewById(R.id.something_r);
//        TextView contactName = findViewById(R.id.contact_nam);
        TextView contactEmail = findViewById(R.id.name_email_);
        TextView contactPhone = findViewById(R.id.some_id);

        gardenName.setText(garden.getGardenName());
        address.setText(garden.getAddress());
//        contactName.setText(garden.getContactName());
        contactEmail.setText(garden.getContactEmail());
        contactPhone.setText(garden.getContactPhoneNumber());
    }

    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null && googleProfileInformation == null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }

    private void drawGardenLocationMarker(Garden garden) {
        Drawable greenMarker = getResources().getDrawable(R.drawable.location_marker_green);
        BitmapDescriptor markerIcon = getMarkerIconFromDrawable(greenMarker);

        Marker marker = mMap.addMarker(new MarkerOptions()
                .position(garden.getLocation())
                .title(garden.getGardenName())
                .icon(markerIcon)
        );
        gardenMarkerMap.put(marker, garden);
    }
    
    private void drawCurrentLocationMarker() {
        Drawable redMarker = getResources().getDrawable(R.drawable.location_marker_red);
        BitmapDescriptor markerIcon = getMarkerIconFromDrawable(redMarker);

        LatLng currentLocation = new LatLng(locationLat, locationLong);
        mapsMarker = mMap.addMarker(new MarkerOptions()
                .position(currentLocation)
                .title("Current Location")
                .icon(markerIcon)
        );
    }

    private BitmapDescriptor getMarkerIconFromDrawable(Drawable drawable) {
        Canvas canvas = new Canvas();
        Bitmap bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
        canvas.setBitmap(bitmap);
        drawable.setBounds(0, 0, drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight());
        drawable.draw(canvas);
        return BitmapDescriptorFactory.fromBitmap(bitmap);
    }

    private void requestGardens() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "http://10.0.2.2:8081/gardens/";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
            Request.Method.GET,
            url,
            null,
            (JSONObject response) -> {
                try {
                    Log.d(TAG, "Obtaining gardens");
                    JSONArray fetchedGardens = (JSONArray)response.get("data");
                    if (fetchedGardens.length() > 0) {
                        gardenList.clear();
                        for (int i =0; i < Math.min(fetchedGardens.length(), 3); i++) {
                            JSONObject updateGardenObject = fetchedGardens.getJSONObject(i);
                            Garden garden = new Garden(updateGardenObject);
                            gardenList.add(garden);
                            drawGardenLocationMarker(garden);
                        }
                        Bundle extras = getIntent().getExtras();
                        if (extras != null) {
                            Garden selectedFromSearch = gardenList.get(extras.getInt("moveToSelectedIndex"));
                            mMap.moveCamera(CameraUpdateFactory.newLatLng(selectedFromSearch.getLocation()));
                        }
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
}