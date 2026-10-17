package com.triagenet.companion;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String LOCAL_ASSET_URL = "file:///android_asset/index.html";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(false);

        webView.addJavascriptInterface(new WebAppInterface(this), "AndroidBridge");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    Toast.makeText(MainActivity.this, "Workstation offline. Loading local companion...", Toast.LENGTH_SHORT).show();
                    view.loadUrl(LOCAL_ASSET_URL);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    view.loadUrl(request.getUrl().toString());
                    return true;
                }
                return false;
            }
        });

        webView.loadUrl(LOCAL_ASSET_URL);
    }

    public class WebAppInterface {
        Context mContext;

        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void showToast(String toast) {
            Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
        }

        @JavascriptInterface
        public void loadLiveWorkstation(final String targetUrl) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webView.loadUrl(targetUrl);
                }
            });
        }

        @JavascriptInterface
        public void loadOfflineHome() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webView.loadUrl(LOCAL_ASSET_URL);
                }
            });
        }

        @JavascriptInterface
        public void triggerDownloadAndInstall(final String apkUrl) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(mContext, "Downloading OTA Update Package...", Toast.LENGTH_SHORT).show();
                    new DownloadAndInstallTask().execute(apkUrl);
                }
            });
        }
    }

    private class DownloadAndInstallTask extends AsyncTask<String, Void, File> {
        @Override
        protected File doInBackground(String... urls) {
            try {
                String apkUrl = urls[0];
                if (apkUrl.startsWith("/")) {
                    apkUrl = "http://10.0.2.2:3000" + apkUrl;
                }
                URL url = new URL(apkUrl);
                HttpURLConnection c = (HttpURLConnection) url.openConnection();
                c.setRequestMethod("GET");
                c.setConnectTimeout(8000);
                c.setReadTimeout(15000);
                c.connect();

                File outputFile = new File(getExternalFilesDir(null), "update.apk");
                if (outputFile.exists()) {
                    outputFile.delete();
                }

                FileOutputStream fos = new FileOutputStream(outputFile);
                InputStream is = c.getInputStream();

                byte[] buffer = new byte[8192];
                int len;
                while ((len = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, len);
                }
                fos.close();
                is.close();
                return outputFile;
            } catch (Exception e) {
                return null;
            }
        }

        @Override
        protected void onPostExecute(File file) {
            if (file != null && file.exists()) {
                Toast.makeText(MainActivity.this, "Update Downloaded! Launching Installer...", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setDataAndType(Uri.fromFile(file), "application/vnd.android.package-archive");
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try {
                    startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Install failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            } else {
                Toast.makeText(MainActivity.this, "Update download failed. Check network connection.", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else if (webView != null && webView.getUrl() != null && !webView.getUrl().equals(LOCAL_ASSET_URL)) {
            webView.loadUrl(LOCAL_ASSET_URL);
        } else {
            super.onBackPressed();
        }
    }
}
