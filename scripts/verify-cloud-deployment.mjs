import { pathToFileURL } from "node:url";

export async function verifyDeploymentConfig({ baseUrl, environment, fetcher = fetch }) {
  if (!baseUrl || !baseUrl.startsWith("https://")) {
    throw new Error("baseUrl must be a valid HTTPS URL");
  }

  const liveUrl = `${baseUrl.replace(/\/+$/, "")}/api/health/live`;
  const res = await fetcher(liveUrl);
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }

  return { verified: true, baseUrl, environment };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const baseUrl = process.argv[2];
  const environment = process.argv[3] || "preview";
  verifyDeploymentConfig({ baseUrl, environment })
    .then((r) => console.log(`Deployment verified successfully for ${r.baseUrl}`))
    .catch((err) => {
      console.error(`Deployment verification failed: ${err.message}`);
      process.exit(1);
    });
}
