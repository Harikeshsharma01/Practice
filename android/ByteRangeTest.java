import com.sewestian.learning.ByteRange;
import java.util.Arrays;

public class ByteRangeTest {
  public static void main(String[] args) {
    check("bytes=0-99", 1000, 0, 99);
    check("bytes=500-", 1000, 500, 999);
    check("bytes=-100", 1000, 900, 999);
    check("bytes=0-9999", 1000, 0, 999);
    for (String bad :
        new String[] {
          "bytes=1000-",
          "bytes=10-5",
          "bytes=-0",
          "bytes=-",
          "bytes=0-1,5-6",
          "bytes=x-y",
          "bytes=9999999999999999999999-"
        }) {
      try {
        ByteRange.parse(bad, 1000);
        throw new AssertionError(bad);
      } catch (IllegalArgumentException expected) {
      }
    }
    System.out.println("PASS: offline video range/seek boundaries and malformed ranges");
  }

  static void check(String s, long length, long a, long b) {
    if (!Arrays.equals(ByteRange.parse(s, length), new long[] {a, b})) throw new AssertionError(s);
  }
}
