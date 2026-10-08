package com.sewestian.learning;

/** Single HTTP byte-range parser for seekable offline lesson videos. */
public final class ByteRange {
  public static long[] parse(String range, long length) {
    if (length <= 0 || !range.matches("bytes=[0-9]*-[0-9]*")) throw new IllegalArgumentException();
    String[] parts = range.substring(6).split("-", -1);
    try {
      long start, end;
      if (parts[0].isEmpty()) {
        long suffix = Long.parseLong(parts[1]);
        if (suffix <= 0) throw new IllegalArgumentException();
        start = Math.max(0, length - suffix);
        end = length - 1;
      } else {
        start = Long.parseLong(parts[0]);
        end = parts[1].isEmpty() ? length - 1 : Math.min(Long.parseLong(parts[1]), length - 1);
      }
      if (start < 0 || start >= length || end < start) throw new IllegalArgumentException();
      return new long[] {start, end};
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException(e);
    }
  }
}
