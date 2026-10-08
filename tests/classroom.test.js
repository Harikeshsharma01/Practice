import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { createApp, hashPassword } from "../server/app.js";
import { createStore } from "../server/store.js";
import { localPeer } from "../server/classroom.js";
const interfaces = {
  wifi: [
    {
      family: "IPv4",
      address: "192.168.10.5",
      netmask: "255.255.255.0",
      internal: false,
    },
  ],
};
test("LAN boundary uses directly attached private subnets, not arbitrary private or public addresses", () => {
  for (const ip of [
    "192.168.10.20",
    "::ffff:192.168.10.40",
    "127.0.0.1",
    "::1",
  ])
    assert.equal(localPeer(ip, interfaces), true, ip);
  for (const ip of [
    "192.168.11.20",
    "10.0.0.7",
    "8.8.8.8",
    "999.3.4.5",
    "2001:db8::1",
    "",
  ])
    assert.equal(localPeer(ip, interfaces), false, ip);
  assert.equal(
    localPeer("8.8.8.8", {
      eth: [
        {
          family: "IPv4",
          address: "8.8.8.7",
          netmask: "255.255.255.0",
          internal: false,
        },
      ],
    }),
    false,
  );
});
test("local classroom requires code plus approval; protects media, supports removal and invalidates old sessions", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "class-access-"));
  const store = await createStore({ directory: dir });
  const password = "Long-test-password-9482";
  await store.set("admin", {
    email: "teacher@example.test",
    passwordHash: hashPassword(password),
  });
  const server = createApp(store, { classroomLan: true, interfaces }).listen(
    0,
    "127.0.0.1",
  );
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const phone =
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36";
  async function request(
    url,
    { cookie = "", body, method = body ? "POST" : "GET", mobile = true } = {},
  ) {
    return fetch(base + "/api" + url, {
      method,
      headers: {
        "content-type": "application/json",
        "user-agent": mobile ? phone : "Desktop browser",
        ...(cookie ? { cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
  try {
    for (const resource of [
      "/%76ideos/computer-systems.mp4",
      "/videos%2fcomputer-systems.mp4",
    ])
      assert.equal((await fetch(base + resource)).status, 403);
    assert.equal(
      (
        await fetch(base + "/api/classroom/status", {
          headers: { "x-forwarded-for": "192.168.10.20" },
        })
      ).status,
      403,
    );
    assert.equal((await request("/catalog")).status, 403);
    assert.equal((await request("/media/unknown")).status, 403);
    assert.equal(
      (await fetch(base + "/videos/computer-systems.mp4")).status,
      403,
    );
    assert.equal((await request("/admin/classroom")).status, 401);
    assert.equal(
      (
        await request("/classroom/status", { mobile: false }).then((r) =>
          r.json(),
        )
      ).status,
      "phone",
    );
    const login = await request("/auth/login", {
      body: { email: "teacher@example.test", password },
    });
    assert.equal(login.status, 200);
    const teacher = login.headers.get("set-cookie").split(";")[0];
    assert.equal(
      (await request("/catalog", { cookie: teacher, mobile: false })).status,
      200,
    );
    assert.equal(
      (await request("/admin/classroom/new", { cookie: teacher, body: {} }))
        .status,
      200,
    );
    let room = await request("/admin/classroom", { cookie: teacher }).then(
      (r) => r.json(),
    );
    assert.match(room.code, /^\d{6}$/);
    assert.equal(
      (
        await request("/classroom/join", {
          body: { name: "Test student", code: "000000" },
        })
      ).status,
      403,
    );
    const join = await request("/classroom/join", {
      body: { name: "Test student", code: room.code },
    });
    assert.equal(join.status, 201);
    assert.match(join.headers.get("set-cookie"), /HttpOnly/);
    const student = join.headers.get("set-cookie").split(";")[0];
    assert.equal(
      (
        await request("/classroom/status", { cookie: student }).then((r) =>
          r.json(),
        )
      ).status,
      "pending",
    );
    assert.equal((await request("/catalog", { cookie: student })).status, 403);
    room = await request("/admin/classroom", { cookie: teacher }).then((r) =>
      r.json(),
    );
    const id = room.members[0].id;
    assert.equal(
      (
        await request("/admin/classroom/members/" + id, {
          cookie: student,
          body: { status: "approved" },
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await request("/admin/classroom/members/" + id, {
          cookie: teacher,
          body: { status: "approved" },
        })
      ).status,
      200,
    );
    assert.equal((await request("/catalog", { cookie: student })).status, 200);
    const video = await fetch(base + "/videos/computer-systems.mp4", {
      headers: { cookie: student, "user-agent": phone, Range: "bytes=0-99" },
    });
    assert.equal(video.status, 206);
    assert.match(video.headers.get("cache-control"), /no-store/);
    const publicState = await request("/classroom/status", {
      cookie: student,
    }).then((r) => r.json());
    assert.ok(!publicState.code && !publicState.members);
    await request("/admin/classroom/settings", {
      cookie: teacher,
      body: { open: false, phoneOnly: true, privacy: true },
    });
    assert.equal(
      (await request("/catalog", { cookie: student })).status,
      200,
      "closing admissions retains approved access",
    );
    assert.equal(
      (
        await request("/classroom/join", {
          body: { name: "Second student", code: room.code },
        })
      ).status,
      403,
    );
    await request("/admin/classroom/members/" + id, {
      cookie: teacher,
      body: { status: "revoked" },
    });
    assert.equal((await request("/catalog", { cookie: student })).status, 403);
    await request("/admin/classroom/members/" + id, {
      cookie: teacher,
      body: { status: "approved" },
    });
    const member = await store.get("classroom-member-" + id);
    await store.set("classroom-member-" + id, {
      ...member,
      expires: Date.now() - 1,
    });
    assert.equal(
      (await request("/catalog", { cookie: student })).status,
      403,
      "expired approval is rejected",
    );
    await store.set("classroom-member-" + id, member);
    await request("/admin/classroom/end", { cookie: teacher, body: {} });
    assert.equal(
      (await request("/catalog", { cookie: student })).status,
      403,
      "ending a class revokes existing cookies",
    );
    await request("/admin/classroom/new", { cookie: teacher, body: {} });
    assert.equal(
      (await request("/catalog", { cookie: student })).status,
      403,
      "new class cannot restore old access",
    );
    const html = await fetch(base);
    assert.ok(
      !html.headers
        .get("content-security-policy")
        .includes("upgrade-insecure-requests"),
      "LAN HTTP assets must not be upgraded to HTTPS",
    );
  } finally {
    await new Promise((r) => server.close(r));
    await rm(dir, { recursive: true, force: true });
  }
});
