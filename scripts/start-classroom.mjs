import "dotenv/config";
// Cross-platform entry point; a single Express origin serves the built app and API.
process.env.CLASSROOM_LAN = "1";
process.env.NODE_ENV = "development";
process.env.CLIENT_ORIGIN = "";
process.env.PORT = process.env.CLASSROOM_PORT || "4100";
console.log(
  `Local classroom is starting on port ${process.env.PORT}. Open the local server in your browser, choose Teacher sign-in, then Classroom access. Public hosting is separate.`,
);
console.log(`Teacher browser address: localhost:${process.env.PORT}`);
await import("../server/index.js");
