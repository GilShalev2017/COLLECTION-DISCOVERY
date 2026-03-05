import axios from "axios";

async function testImageUrls() {
  const testUrls = [
    "https://images.metmuseum.org/CRDImages/md/original/DP-38911-001.jpg",
    "https://images.metmuseum.org/CRDImages/rl/original/DT3076.jpg"
  ];

  console.log("[TEST] Checking image URL accessibility...");
  
  for (const url of testUrls) {
    try {
      console.log(`[TEST] Testing: ${url}`);
      const response = await axios.head(url, { timeout: 10000 });
      console.log(`[TEST] ✅ ${url} - Status: ${response.status}, Content-Type: ${response.headers['content-type']}`);
    } catch (error: any) {
      console.error(`[TEST] ❌ ${url} - Error: ${error.message}`);
      if (error.code) console.error(`[TEST] Code: ${error.code}`);
    }
  }
}

testImageUrls().catch(console.error);
