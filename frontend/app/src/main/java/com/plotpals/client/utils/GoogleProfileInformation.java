package com.plotpals.client.utils;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;

public class GoogleProfileInformation {
    @NonNull
    private String accountGoogleName;
    @NonNull
    private String accountGoogleProfilePictureImageUrl;
    @NonNull
    private String accountUserId;

    /**
    * this is the jwt token that will be attached to the authorization header of every api request to server
    */
    @NonNull
    private String accountIdToken;

    public GoogleProfileInformation(String accountGoogleName, String accountGoogleProfilePictureImageUrl, String accountUserId, String accountIdToken) {
        this.accountGoogleName = accountGoogleName;
        this.accountGoogleProfilePictureImageUrl = accountGoogleProfilePictureImageUrl;
        this.accountUserId = accountUserId;
        this.accountIdToken = accountIdToken;
    }

    public GoogleProfileInformation(Bundle extras) {
        accountIdToken = extras.getString("accountIdToken");
        accountGoogleName = extras.getString("accountGoogleName");
        accountUserId = extras.getString("accountUserId");
        accountGoogleProfilePictureImageUrl = extras.getString("accountGoogleProfilePictureImageUrl");
    }

    public Intent loadGoogleProfileInformationToIntent(Intent intent) {
        intent.putExtra("accountGoogleName", accountGoogleName);
        intent.putExtra("accountGoogleProfilePictureImageUrl", accountGoogleProfilePictureImageUrl);
        intent.putExtra("accountUserId", accountUserId);
        intent.putExtra("accountIdToken", accountIdToken);
        return intent;
    }

    @NonNull
    public String getAccountGoogleName() {
        return accountGoogleName;
    }

    @NonNull
    public String getAccountGoogleProfilePictureImageUrl() {
        return accountGoogleProfilePictureImageUrl;
    }

    @NonNull
    public String getAccountUserId() {
        return accountUserId;
    }

    @NonNull
    public String getAccountIdToken() {
        return accountIdToken;
    }
}
