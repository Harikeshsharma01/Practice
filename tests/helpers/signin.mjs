export async function ensureStudent(page, base) {
  const status = await (
    await page.request.get(base + "/api/student/status")
  ).json();
  if (!status.required || status.authenticated) return;
  const id = crypto.randomUUID();
  const response = await page.request.post(base + "/api/student/signup", {
    data: {
      name: "Browser test learner",
      email: `browser-${id}@example.test`,
      password: "test-password-" + id,
    },
  });
  if (response.status() !== 201)
    throw new Error(
      "Could not create isolated test learner: " + response.status(),
    );
}
