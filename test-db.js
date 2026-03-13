const url = "https://ctdwebsite.vercel.app/api/auth/trainer-register";

async function test() {
  console.log("Testing POST to", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        password: "TestPassword123",
        organization: "Test Org",
        token: "invalid-token"
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

test();
