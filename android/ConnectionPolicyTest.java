import com.sewestian.learning.ConnectionPolicy;

public class ConnectionPolicyTest {
  public static void main(String[] args) {
    equal(ConnectionPolicy.normalize("192.168.1.20:4100", true), "http://192.168.1.20:4100");
    equal(ConnectionPolicy.normalize(" https://example.com/ ", false), "https://example.com");
    equal(ConnectionPolicy.normalize("example.com:8443", false), "https://example.com:8443");
    for (String bad :
        new String[] {
          "http://example.com",
          "https://user:pass@example.com",
          "https://example.com/login",
          "https://example.com?secret=yes",
          "javascript:alert(1)",
          "file:///etc/passwd",
          "https://example.com:65536",
          "https://example.com:0"
        }) reject(bad, false);
    for (String bad :
        new String[] {
          "127.0.0.1:4100",
          "8.8.8.8",
          "172.32.0.1",
          "192.168.01.2",
          "192.168.1.300",
          "localhost:4100",
          "https://example.com",
          "http://192.168.1.1@evil.example"
        }) reject(bad, true);
    for (String good : new String[] {"10.0.2.2", "172.16.0.1", "172.31.255.254", "192.168.1.2"})
      if (!ConnectionPolicy.privateIPv4(good)) throw new AssertionError(good);
    if (!ConnectionPolicy.sameOrigin("https://example.com", "https://example.com:443/lesson/x"))
      throw new AssertionError();
    if (ConnectionPolicy.sameOrigin("https://example.com", "https://example.com.evil/"))
      throw new AssertionError();
    if (ConnectionPolicy.subresourceAllowed("http://192.168.1.2:4100", "http://evil.example/track"))
      throw new AssertionError();
    if (ConnectionPolicy.subresourceAllowed("https://example.com", "content://private/record"))
      throw new AssertionError();
    System.out.println(
        "PASS: hosted/LAN origins, private IPv4, URL rejection, same-origin and resource"
            + " restrictions");
  }

  static void equal(String a, String b) {
    if (!a.equals(b)) throw new AssertionError(a + " != " + b);
  }

  static void reject(String value, boolean local) {
    try {
      ConnectionPolicy.normalize(value, local);
      throw new AssertionError("Accepted " + value);
    } catch (IllegalArgumentException expected) {
    }
  }
}
