package com.sewestian.learning;

import android.app.Activity;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;
import org.json.JSONTokener;

/** Small native Android client. The MERN server continues to run on the teacher PC or hosting. */
public final class MainActivity extends Activity {
  private static final int BG = 0xff0c1022,
      PANEL = 0xff171a33,
      INK = 0xfff1eaff,
      MUTED = 0xffb7bdd8,
      ACCENT = 0xffc5a7f4;
  private static final int PICK_FILE = 41, SAVE_FILE = 42, MAX_DOWNLOAD = 12 * 1024 * 1024;
  private final Handler handler = new Handler(Looper.getMainLooper());
  private final ExecutorService executor = Executors.newSingleThreadExecutor();
  private FrameLayout content;
  private ProgressBar progress;
  private WebView web;
  private View fullVideo;
  private WebChromeClient.CustomViewCallback fullVideoCallback;
  private String base = OfflineAssets.ORIGIN;
  private boolean setup = true, failed = false;
  private ValueCallback<Uri[]> uploadCallback;
  private Download pendingDownload;

  private static final class Download {
    String url, mime, name;
    byte[] bytes;

    Download(String u, String m, String n) {
      url = u;
      mime = m;
      name = n;
    }
  }

  @Override
  public void onCreate(Bundle state) {
    super.onCreate(state);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
    getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
    LinearLayout shell = new LinearLayout(this);
    shell.setOrientation(LinearLayout.VERTICAL);
    shell.setBackgroundColor(BG);
    shell.setOnApplyWindowInsetsListener(
        (v, insets) -> {
          v.setPadding(
              insets.getSystemWindowInsetLeft(),
              insets.getSystemWindowInsetTop(),
              insets.getSystemWindowInsetRight(),
              insets.getSystemWindowInsetBottom());
          return insets.consumeSystemWindowInsets();
        });
    progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
    progress.setProgressTintList(ColorStateList.valueOf(ACCENT));
    progress.setVisibility(View.GONE);
    shell.addView(progress, new LinearLayout.LayoutParams(-1, dp(3)));
    content = new FrameLayout(this);
    shell.addView(content, new LinearLayout.LayoutParams(-1, 0, 1));
    setContentView(shell);
    createWebView();
    openWeb();
    web.loadUrl(base + "/");
  }

  private int dp(int value) {
    return Math.round(value * getResources().getDisplayMetrics().density);
  }

  private TextView text(String value, int size, int color) {
    TextView v = new TextView(this);
    v.setText(value);
    v.setTextSize(size);
    v.setTextColor(color);
    v.setGravity(Gravity.CENTER_VERTICAL);
    v.setLineSpacing(dp(3), 1);
    return v;
  }

  private GradientDrawable rounded(int color) {
    GradientDrawable d = new GradientDrawable();
    d.setColor(color);
    d.setCornerRadius(dp(14));
    d.setStroke(dp(1), 0xff554568);
    return d;
  }

  private Button button(String label, boolean primary) {
    Button b = new Button(this);
    b.setText(label);
    b.setAllCaps(false);
    b.setTextSize(12);
    b.setTextColor(primary ? BG : INK);
    b.setBackgroundTintList(ColorStateList.valueOf(primary ? ACCENT : 0xff252940));
    b.setMinHeight(dp(44));
    return b;
  }

  private void add(LinearLayout parent, View child, int gap) {
    LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
    p.bottomMargin = dp(gap);
    parent.addView(child, p);
  }

  private void createWebView() {
    web = new WebView(this);
    web.setBackgroundColor(BG);
    WebView.setWebContentsDebuggingEnabled(false);
    WebSettings settings = web.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowFileAccess(false);
    settings.setAllowContentAccess(true);
    settings.setAllowFileAccessFromFileURLs(false);
    settings.setAllowUniversalAccessFromFileURLs(false);
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    settings.setMediaPlaybackRequiresUserGesture(true);
    settings.setSupportMultipleWindows(false);
    settings.setSafeBrowsingEnabled(true);
    settings.setBuiltInZoomControls(true);
    settings.setDisplayZoomControls(false);
    settings.setUserAgentString(settings.getUserAgentString() + " SewestianAndroid/1.0");
    CookieManager.getInstance().setAcceptCookie(true);
    CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
    web.setWebViewClient(
        new WebViewClient() {
          @Override
          public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            if (request.isForMainFrame() && url.equals("sewestian-print://document")) {
              if (ConnectionPolicy.sameOrigin(base, view.getUrl())) printPage();
              return true;
            }
            if (ConnectionPolicy.sameOrigin(base, url)) return false;
            if (!request.isForMainFrame()) return true;
            if (request.hasGesture() && (url.startsWith("https://") || url.startsWith("http://"))) {
              try {
                startActivity(new Intent(Intent.ACTION_VIEW, request.getUrl()));
              } catch (Exception e) {
                message("No browser is available for this link.");
              }
              return true;
            }
            return true;
          }

          @Override
          public WebResourceResponse shouldInterceptRequest(
              WebView view, WebResourceRequest request) {
            return OfflineAssets.response(MainActivity.this, request);
          }

          @Override
          public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
            failed = false;
            if (!setup) {
              progress.setVisibility(View.VISIBLE);
            }
          }

          @Override
          public void onPageFinished(WebView view, String url) {
            progress.setVisibility(View.GONE);
            CookieManager.getInstance().flush();
            if (!failed && ConnectionPolicy.sameOrigin(base, url))
              web.evaluateJavascript(
                  "window.print=function(){window.dispatchEvent(new"
                      + " Event('beforeprint'));window.location.href='sewestian-print://document';};",
                  null);
          }

          @Override
          public void onReceivedError(
              WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame())
              showConnectionError(
                  "The bundled learning page could not be opened. Reopen the app, or reinstall the latest"
                      + " Sewestian APK.");
          }

          @Override
          public void onReceivedHttpError(
              WebView view, WebResourceRequest request, WebResourceResponse response) {
            if (request.isForMainFrame() && response.getStatusCode() >= 400)
              showConnectionError(
                  "The bundled resource returned "
                      + response.getStatusCode()
                      + ". Reinstall the latest APK if reloading does not help.");
          }

          @Override
          public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
            handler.cancel();
            showConnectionError(
                "The HTTPS certificate could not be verified. Fix the server’s certificate; the app"
                    + " will not bypass this check.");
          }
        });
    web.setWebChromeClient(
        new WebChromeClient() {
          @Override
          public void onShowCustomView(View view, CustomViewCallback callback) {
            if (fullVideo != null) {
              callback.onCustomViewHidden();
              return;
            }
            fullVideo = view;
            fullVideoCallback = callback;
            web.setVisibility(View.GONE);
            content.addView(view, new FrameLayout.LayoutParams(-1, -1));
          }

          @Override
          public void onHideCustomView() {
            closeFullVideo();
          }

          @Override
          public void onProgressChanged(WebView view, int value) {
            progress.setProgress(value);
            if (value == 100) progress.setVisibility(View.GONE);
          }

          @Override
          public boolean onShowFileChooser(
              WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (uploadCallback != null) uploadCallback.onReceiveValue(null);
            uploadCallback = callback;
            Intent picker = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            picker.addCategory(Intent.CATEGORY_OPENABLE);
            picker.setType("*/*");
            String[] accepted = params.getAcceptTypes();
            if (accepted.length > 0 && !accepted[0].isEmpty())
              picker.putExtra(Intent.EXTRA_MIME_TYPES, accepted);
            picker.putExtra(
                Intent.EXTRA_ALLOW_MULTIPLE,
                params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
            try {
              startActivityForResult(picker, PICK_FILE);
            } catch (Exception e) {
              uploadCallback.onReceiveValue(null);
              uploadCallback = null;
              message("No file picker is available on this phone.");
            }
            return true;
          }
        });
    web.setDownloadListener(
        (url, agent, disposition, mime, length) -> {
          if (pendingDownload != null) {
            message("Finish your current download first.");
            return;
          }
          String type = mime == null || mime.isEmpty() ? "application/octet-stream" : mime;
          String name =
              URLUtil.guessFileName(url, disposition, type).replaceAll("[^\\p{L}\\p{N}._ -]", "_");
          if (name.length() > 100) name = name.substring(0, 100);
          Download download = new Download(url, type, name);
          if (url.startsWith("blob:") && url.startsWith("blob:" + base + "/")) readBlob(download);
          else if (url.startsWith("data:")) {
            try {
              download.bytes = decodeData(url);
              chooseSave(download);
            } catch (Exception e) {
              message(e.getMessage());
            }
          } else if (ConnectionPolicy.sameOrigin(base, url)) {
            if (length > MAX_DOWNLOAD) {
              message("This download is larger than 12 MB. Use your browser for larger files.");
              return;
            }
            chooseSave(download);
          } else message("Open external downloads in your browser.");
        });
  }

  private void closeFullVideo() {
    if (fullVideo != null) {
      content.removeView(fullVideo);
      fullVideo = null;
      web.setVisibility(View.VISIBLE);
      if (fullVideoCallback != null) fullVideoCallback.onCustomViewHidden();
      fullVideoCallback = null;
    }
  }

  private void openWeb() {
    closeFullVideo();
    setup = false;
    failed = false;
    content.removeAllViews();
    if (web.getParent() != null) ((ViewGroup) web.getParent()).removeView(web);
    content.addView(web, new FrameLayout.LayoutParams(-1, -1));
    web.onResume();
  }

  private void showConnectionError(String detail) {
    if (setup) return;
    failed = true;
    progress.setVisibility(View.GONE);
    content.removeAllViews();
    LinearLayout error = new LinearLayout(this);
    error.setOrientation(LinearLayout.VERTICAL);
    error.setPadding(dp(26), dp(42), dp(26), dp(24));
    add(error, text("Let’s reconnect.", 28, INK), 16);
    add(error, text(detail, 15, MUTED), 20);
    add(error, text("Your lessons are bundled in this APK.", 12, ACCENT), 20);
    Button retry = button("Try again", true);
    retry.setOnClickListener(
        v -> {
          openWeb();
          web.loadUrl(base + "/");
        });
    add(error, retry, 10);
    Button settings = button("Back to sign-in / home", false);
    settings.setOnClickListener(
        v -> {
          openWeb();
          web.loadUrl(base + "/");
        });
    add(error, settings, 0);
    content.addView(error);
  }

  private void readBlob(Download download) {
    pendingDownload = download;
    String key = "__sewestian_" + UUID.randomUUID().toString().replace("-", "");
    String script =
        "(function(){var k="
            + JSONObject.quote(key)
            + ";fetch("
            + JSONObject.quote(download.url)
            + ").then(function(r){return r.blob();}).then(function(b){if(b.size>"
            + MAX_DOWNLOAD
            + ")throw Error('File exceeds the 12 MB app download limit.');var f=new"
            + " FileReader();f.onload=function(){window[k]={data:f.result};};f.onerror=function(){window[k]={error:'Could"
            + " not read the"
            + " download.'};};f.readAsDataURL(b);}).catch(function(e){window[k]={error:e.message};});})();";
    web.evaluateJavascript(script, null);
    pollBlob(download, key, 0);
  }

  private void pollBlob(Download download, String key, int attempt) {
    if (isFinishing() || pendingDownload != download) return;
    if (attempt > 75) {
      pendingDownload = null;
      message("Download timed out. Keep the lesson open and try again.");
      return;
    }
    web.evaluateJavascript(
        "JSON.stringify(window[" + JSONObject.quote(key) + "]||null)",
        raw -> {
          try {
            Object outer = new JSONTokener(raw).nextValue();
            JSONObject result =
                outer instanceof String && !outer.equals("null")
                    ? new JSONObject((String) outer)
                    : null;
            if (result == null) {
              handler.postDelayed(() -> pollBlob(download, key, attempt + 1), 200);
              return;
            }
            web.evaluateJavascript("delete window[" + JSONObject.quote(key) + "]", null);
            pendingDownload = null;
            if (result.has("error")) {
              message(result.getString("error"));
              return;
            }
            download.bytes = decodeData(result.getString("data"));
            chooseSave(download);
          } catch (Exception e) {
            pendingDownload = null;
            message("This download could not be prepared. Try again from the lesson.");
          }
        });
  }

  private byte[] decodeData(String data) {
    int comma = data.indexOf(',');
    if (comma < 0
        || !data.substring(0, comma).endsWith(";base64")
        || data.length() > MAX_DOWNLOAD * 1.4 + 1024)
      throw new IllegalArgumentException("Unsupported download, or file exceeds 12 MB.");
    byte[] bytes = Base64.decode(data.substring(comma + 1), Base64.DEFAULT);
    if (bytes.length > MAX_DOWNLOAD) throw new IllegalArgumentException("File exceeds 12 MB.");
    return bytes;
  }

  private void chooseSave(Download download) {
    pendingDownload = download;
    Intent save = new Intent(Intent.ACTION_CREATE_DOCUMENT);
    save.addCategory(Intent.CATEGORY_OPENABLE);
    save.setType(download.mime);
    save.putExtra(Intent.EXTRA_TITLE, download.name);
    try {
      startActivityForResult(save, SAVE_FILE);
    } catch (Exception e) {
      pendingDownload = null;
      message("No document-saving app is available on this phone.");
    }
  }

  @Override
  protected void onActivityResult(int request, int result, Intent data) {
    super.onActivityResult(request, result, data);
    if (request == PICK_FILE && uploadCallback != null) {
      ArrayList<Uri> uris = new ArrayList<>();
      if (result == RESULT_OK && data != null) {
        if (data.getClipData() != null) {
          for (int i = 0; i < data.getClipData().getItemCount(); i++)
            uris.add(data.getClipData().getItemAt(i).getUri());
        } else if (data.getData() != null) uris.add(data.getData());
      }
      uploadCallback.onReceiveValue(uris.isEmpty() ? null : uris.toArray(new Uri[0]));
      uploadCallback = null;
    }
    if (request == SAVE_FILE) {
      Download download = pendingDownload;
      pendingDownload = null;
      if (result == RESULT_OK && data != null && data.getData() != null && download != null)
        saveDownload(download, data.getData());
    }
  }

  private void saveDownload(Download download, Uri destination) {
    executor.execute(
        () -> {
          try (OutputStream output = getContentResolver().openOutputStream(destination)) {
            if (output == null) throw new java.io.IOException("Cannot write this document.");
            if (download.bytes != null) output.write(download.bytes);
            else if (ConnectionPolicy.sameOrigin(OfflineAssets.ORIGIN, download.url)) {
              try (InputStream input =
                  getAssets().open("www/" + OfflineAssets.assetPath(Uri.parse(download.url)))) {
                byte[] buffer = new byte[16384];
                int count, total = 0;
                while ((count = input.read(buffer)) != -1) {
                  total += count;
                  if (total > MAX_DOWNLOAD) throw new java.io.IOException("File exceeds 12 MB.");
                  output.write(buffer, 0, count);
                }
              }
            } else {
              throw new java.io.IOException(
                  "Only bundled or generated files can be saved in this offline app.");
            }
            runOnUiThread(() -> message("Saved to your chosen folder."));
          } catch (Exception e) {
            runOnUiThread(() -> message("Download failed. " + e.getMessage()));
          }
        });
  }

  private void printPage() {
    PrintManager manager = (PrintManager) getSystemService(PRINT_SERVICE);
    if (manager == null) {
      web.evaluateJavascript("window.dispatchEvent(new Event('afterprint'));", null);
      message("Printing is not available on this phone.");
      return;
    }
    PrintDocumentAdapter delegate = web.createPrintDocumentAdapter("Sewestian study notes");
    PrintDocumentAdapter adapter =
        new PrintDocumentAdapter() {
          @Override
          public void onStart() {
            delegate.onStart();
          }

          @Override
          public void onLayout(
              PrintAttributes oldAttributes,
              PrintAttributes newAttributes,
              CancellationSignal signal,
              LayoutResultCallback callback,
              Bundle extras) {
            delegate.onLayout(oldAttributes, newAttributes, signal, callback, extras);
          }

          @Override
          public void onWrite(
              PageRange[] pages,
              ParcelFileDescriptor destination,
              CancellationSignal signal,
              WriteResultCallback callback) {
            delegate.onWrite(pages, destination, signal, callback);
          }

          @Override
          public void onFinish() {
            delegate.onFinish();
            if (!isFinishing())
              web.evaluateJavascript("window.dispatchEvent(new Event('afterprint'));", null);
          }
        };
    manager.print("Sewestian notes", adapter, new PrintAttributes.Builder().build());
  }

  private void message(String value) {
    Toast.makeText(this, value, Toast.LENGTH_LONG).show();
  }

  @Override
  public void onBackPressed() {
    if (fullVideo != null) {
      closeFullVideo();
      return;
    }
    if (!setup && web.canGoBack()) {
      web.goBack();
    } else super.onBackPressed();
  }

  @Override
  protected void onPause() {
    super.onPause();
    if (web != null) web.onPause();
  }

  @Override
  protected void onResume() {
    super.onResume();
    if (web != null && !setup) web.onResume();
  }

  @Override
  protected void onDestroy() {
    if (uploadCallback != null) uploadCallback.onReceiveValue(null);
    handler.removeCallbacksAndMessages(null);
    executor.shutdownNow();
    if (web != null) {
      web.stopLoading();
      web.destroy();
    }
    super.onDestroy();
  }
}
