package com.plotpals.client.utils;

import android.util.Log;

import com.plotpals.client.BuildConfig;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;

public class TaskSocketHandler {
    static Socket taskSocket;
    private final static String TAG = "TaskSocketHandler";

    public static synchronized void setSocket() {
        try {
            taskSocket = IO.socket(BuildConfig.API_URL + "/");
        } catch (URISyntaxException e) {
            Log.d(TAG, "Error setting socket");
        }
    }

    public static synchronized Socket getSocket() {
        return taskSocket;
    }
}
