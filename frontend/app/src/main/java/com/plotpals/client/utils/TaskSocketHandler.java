package com.plotpals.client.utils;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;

public class TaskSocketHandler {
    static Socket taskSocket;

    public static synchronized void setSocket() {
        try {
            taskSocket = IO.socket("http://10.0.2.2:8081/");
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    public static synchronized Socket getSocket() {
        return taskSocket;
    }
}
