import "dotenv/config";
process.env.NODE_ENV = "development";
process.env.CLASSROOM_LAN = "0";
process.env.CLIENT_ORIGIN = "";
process.env.PORT = process.env.LOCAL_PORT || "4100";
console.log(
  `Local Sewestian website: port ${process.env.PORT}. Create a student account on the sign-in screen.`,
);
await import("../server/index.js");
