package com.plotpals.client.utils;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;

public class TaskSocketHandler {
    static Socket taskSocket;

    public static synchronized void setSocket() {
        try {
            taskSocket = IO.socket("https://xqx6apo57k.execute-api.us-west-2.amazonaws.com/");
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    public static synchronized Socket getSocket() {
        return taskSocket;
    }
}
