package com.sewestian.learning;

import java.net.URI;
import java.util.Locale;

/** No Android dependencies: the same address rules are covered by JVM tests. */
public final class ConnectionPolicy {
  private ConnectionPolicy() {}

  public static String normalize(String input, boolean classroom) {
    if (input == null || input.trim().isEmpty())
      throw new IllegalArgumentException("Enter your Sewestian website or classroom address.");
    String value = input.trim();
    if (!value.contains("://")) value = (classroom ? "http://" : "https://") + value;
    try {
      URI uri = new URI(value);
      String scheme = uri.getScheme().toLowerCase(Locale.ROOT), host = uri.getHost();
      if (host == null
          || uri.getUserInfo() != null
          || uri.getQuery() != null
          || uri.getFragment() != null
          || (uri.getRawPath() != null
              && !uri.getRawPath().isEmpty()
              && !uri.getRawPath().equals("/"))
          || uri.getPort() == 0
          || uri.getPort() > 65535
          || uri.getPort() < -1)
        throw new IllegalArgumentException(
            "Use the website's main address, without a page path, password or query.");
      if (classroom) {
        if ((!scheme.equals("http") && !scheme.equals("https")) || !privateIPv4(host))
          throw new IllegalArgumentException(
              "Use the private IPv4 address shown by your teacher, such as 192.168.1.20:4100.");
      } else if (!scheme.equals("https")) {
        throw new IllegalArgumentException(
            "A hosted website must use HTTPS. Select Classroom Wi-Fi for a local HTTP address.");
      }
      return scheme
          + "://"
          + host.toLowerCase(Locale.ROOT)
          + (uri.getPort() == -1 ? "" : ":" + uri.getPort());
    } catch (java.net.URISyntaxException e) {
      throw new IllegalArgumentException(
          "That address is not valid. Copy the address from your teacher or hosting dashboard.");
    }
  }

  public static boolean privateIPv4(String host) {
    String[] pieces = host.split("\\.", -1);
    if (pieces.length != 4) return false;
    int[] n = new int[4];
    for (int i = 0; i < 4; i++) {
      if (!pieces[i].matches("0|[1-9][0-9]{0,2}")) return false;
      try {
        n[i] = Integer.parseInt(pieces[i]);
      } catch (NumberFormatException e) {
        return false;
      }
      if (n[i] > 255) return false;
    }
    return n[0] == 10 || (n[0] == 192 && n[1] == 168) || (n[0] == 172 && n[1] >= 16 && n[1] <= 31);
  }

  public static boolean sameOrigin(String first, String second) {
    try {
      URI a = new URI(first), b = new URI(second);
      return a.getHost() != null
          && b.getHost() != null
          && a.getScheme().equalsIgnoreCase(b.getScheme())
          && a.getHost().equalsIgnoreCase(b.getHost())
          && port(a) == port(b)
          && b.getUserInfo() == null;
    } catch (Exception e) {
      return false;
    }
  }

  private static int port(URI uri) {
    return uri.getPort() != -1
        ? uri.getPort()
        : "https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80;
  }

  public static boolean subresourceAllowed(String base, String address) {
    try {
      URI uri = new URI(address);
      String scheme = uri.getScheme();
      return "https".equalsIgnoreCase(scheme)
          || "data".equalsIgnoreCase(scheme)
          || "blob".equalsIgnoreCase(scheme)
          || ("http".equalsIgnoreCase(scheme) && sameOrigin(base, address));
    } catch (Exception e) {
      return false;
    }
  }
}
