package com.sewestian.learning;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import java.io.*;
import java.util.*;

/** Serves only bundled assets at a secure virtual origin; no local file or network bridge. */
public final class OfflineAssets {
  public static final String ORIGIN = "https://appassets.androidplatform.net";

  public static String assetPath(Uri uri) throws IOException {
    if (!"https".equals(uri.getScheme())
        || !"appassets.androidplatform.net".equals(uri.getHost())
        || uri.getPort() != -1) throw new IOException("Unsupported offline origin");
    String path = uri.getPath();
    if (path == null || path.contains("..") || path.contains("\\") || path.indexOf('\0') >= 0)
      throw new IOException("Invalid asset path");
    if (path.equals("/")
        || path.matches("/(notes|courses|animations|labs|practicals|support|admin|mobile)(/)?")
        || path.matches("/(lesson|course|book|unit)/[a-zA-Z0-9-]+")) return "index.html";
    if (!path.startsWith("/assets/")
        && !path.startsWith("/videos/")
        && !path.equals("/offline/catalog.json")
        && !path.matches("/[a-zA-Z0-9_-]+\\.(svg|ico|png)"))
      throw new IOException("Asset not available");
    return path.substring(1);
  }

  private static String mime(String path) {
    if (path.endsWith(".html")) return "text/html";
    if (path.endsWith(".js")) return "text/javascript";
    if (path.endsWith(".css")) return "text/css";
    if (path.endsWith(".json")) return "application/json";
    if (path.endsWith(".mp4")) return "video/mp4";
    if (path.endsWith(".webm")) return "video/webm";
    if (path.endsWith(".vtt")) return "text/vtt";
    if (path.endsWith(".svg")) return "image/svg+xml";
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
    if (path.endsWith(".woff2")) return "font/woff2";
    if (path.endsWith(".woff")) return "font/woff";
    return "application/octet-stream";
  }

  public static WebResourceResponse response(Context context, WebResourceRequest req) {
    InputStream stream = null;
    try {
      String path = assetPath(req.getUrl());
      long length;
      try {
        AssetFileDescriptor fd = context.getAssets().openFd("www/" + path);
        length = fd.getLength();
        stream = fd.createInputStream();
      } catch (IOException compressed) {
        try (InputStream input = context.getAssets().open("www/" + path);
            ByteArrayOutputStream bytes = new ByteArrayOutputStream()) {
          byte[] buffer = new byte[16384];
          int n;
          while ((n = input.read(buffer)) != -1) bytes.write(buffer, 0, n);
          byte[] content = bytes.toByteArray();
          length = content.length;
          stream = new ByteArrayInputStream(content);
        }
      }
      Map<String, String> headers = new HashMap<>();
      headers.put("Cache-Control", "no-store");
      headers.put("Accept-Ranges", "bytes");
      headers.put("X-Content-Type-Options", "nosniff");
      headers.put(
          "Content-Security-Policy",
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'"
              + " data: blob:; font-src 'self'; connect-src 'self' blob: data:; media-src 'self'"
              + " blob:; frame-src 'none'; object-src 'none'");
      String range = req.getRequestHeaders().get("Range");
      if (range == null) range = req.getRequestHeaders().get("range");
      long start = 0, end = length - 1;
      int status = 200;
      if (range != null) {
        try {
          long[] bounds = ByteRange.parse(range, length);
          start = bounds[0];
          end = bounds[1];
          status = 206;
          headers.put("Content-Range", "bytes " + start + "-" + end + "/" + length);
        } catch (IllegalArgumentException invalid) {
          stream.close();
          headers.put("Content-Range", "bytes */" + length);
          return new WebResourceResponse(
              mime(path),
              null,
              416,
              "Range Not Satisfiable",
              headers,
              new ByteArrayInputStream(new byte[0]));
        }
      }
      long remaining = start;
      while (remaining > 0) {
        long n = stream.skip(remaining);
        if (n <= 0) {
          if (stream.read() < 0) throw new IOException("Unexpected end of asset");
          n = 1;
        }
        remaining -= n;
      }
      headers.put("Content-Length", Long.toString(end - start + 1));
      return new WebResourceResponse(
          mime(path),
          mime(path).startsWith("text/") ? "UTF-8" : null,
          status,
          status == 206 ? "Partial Content" : "OK",
          headers,
          new Limited(stream, end - start + 1));
    } catch (Exception e) {
      if (stream != null)
        try {
          stream.close();
        } catch (IOException ignored) {
        }
      return new WebResourceResponse(
          "text/plain",
          "UTF-8",
          404,
          "Not Found",
          Collections.singletonMap("Cache-Control", "no-store"),
          new ByteArrayInputStream(
              "Offline resource unavailable".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }
  }

  private static final class Limited extends FilterInputStream {
    private long left;

    Limited(InputStream in, long length) {
      super(in);
      left = length;
    }

    public int read() throws IOException {
      if (left <= 0) return -1;
      int n = in.read();
      if (n >= 0) left--;
      return n;
    }

    public int read(byte[] b, int off, int len) throws IOException {
      if (len == 0) return 0;
      if (left <= 0) return -1;
      int n = in.read(b, off, (int) Math.min(left, len));
      if (n > 0) left -= n;
      return n;
    }
  }
}
