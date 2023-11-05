package com.plotpals.client.Account;

import androidx.appcompat.app.AppCompatActivity;

import android.graphics.Typeface;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.plotpals.client.R;
import com.plotpals.client.data.Role;
import com.plotpals.client.utils.GoogleProfileInformation;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class AccountRolesActivity extends AppCompatActivity {

    final String TAG = "RolesActivity";

    GoogleProfileInformation googleProfileInformation;

    ListView RolesListView;

    ArrayList<Role> rolesList;

    ArrayAdapter<Role> rolesListAdapter;

    ImageView BackArrowImageView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_roles);
        loadExtras();

        BackArrowImageView = findViewById(R.id.roles_back_arrow_image_view);
        BackArrowImageView.setOnClickListener(view -> {
            getOnBackPressedDispatcher().onBackPressed();
        });

        RolesListView = findViewById(R.id.roles_items_list_view);
        rolesList = new ArrayList<Role>();
        rolesListAdapter = new ArrayAdapter (AccountRolesActivity.this, android.R.layout.simple_list_item_2, android.R.id.text1, rolesList)
        {
            public View getView(int position, View convertView, ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                TextView text1 = view.findViewById(android.R.id.text1);
                TextView text2 = view.findViewById(android.R.id.text2);
                text1.setText(rolesList.get(position).getGardenName());
                text1.setTypeface(null, Typeface.BOLD);

                text2.setText(rolesList.get(position).getRoleNum() + "\n");

                ViewGroup.LayoutParams params = view.getLayoutParams();
                params.height = ViewGroup.LayoutParams.WRAP_CONTENT;
                view.setLayoutParams(params);
                return view;
            }
        };
        RolesListView.setAdapter(rolesListAdapter);

    }

    @Override
    protected void onStart()
    {
        super.onStart();
        requestRoles();
    }

    private void requestRoles() {
        RequestQueue volleyQueue = Volley.newRequestQueue(this);
        String url = "https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/roles/";

        Request<?> jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                url,
                null,

                (JSONObject response) -> {
                    try {
                        Log.d(TAG, "Obtaining roles");
                        JSONArray fetchedRoles = (JSONArray)response.get("data");
                        if(fetchedRoles.length() > 0) {
                            rolesList.clear();
                            for (int i = 0; i < fetchedRoles.length(); i++) {
                                JSONObject rolesJSONObject = fetchedRoles.getJSONObject(i);
                                Role role = new Role(rolesJSONObject);
                                rolesList.add(role);
                            }

                            rolesListAdapter.notifyDataSetChanged();
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

    /**
     * load extras forwarded from previous activity
     */
    private void loadExtras() {
        Bundle extras = getIntent().getExtras();

        if (extras != null) {
            googleProfileInformation = new GoogleProfileInformation(extras);
        }
    }
}