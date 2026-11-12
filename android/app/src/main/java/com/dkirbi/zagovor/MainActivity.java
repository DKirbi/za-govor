package com.dkirbi.zagovor;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // The system back button belongs to the game: it pauses a running puzzle, closes an open
        // panel or goes back to the start screen. window.zgBack() (src/mobile.js) answers "exit"
        // only on the start screen, and only then does back leave the app.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() == null || getBridge().getWebView() == null) {
                    finish();
                    return;
                }
                getBridge().getWebView().evaluateJavascript(
                    "(window.zgBack ? window.zgBack() : 'exit')",
                    value -> {
                        if ("\"exit\"".equals(value)) finish();
                    }
                );
            }
        });
    }
}
