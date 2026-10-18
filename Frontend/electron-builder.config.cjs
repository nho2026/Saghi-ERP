// Release endpoints are configured at build time, never from renderer input.
const endpoint = process.env.NHO_UPDATE_URL;
if (
  endpoint &&
  (new URL(endpoint).protocol !== "https:" ||
    new URL(endpoint).username ||
    new URL(endpoint).password)
)
  throw new Error("NHO_UPDATE_URL must be an HTTPS URL without credentials.");
const github = process.env.NHO_UPDATE_GITHUB;
if (github && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(github))
  throw new Error("NHO_UPDATE_GITHUB must be owner/repository.");
if (github && endpoint) throw new Error("Choose one update source.");
module.exports = {
  ...require("./package.json").build,
  ...(endpoint
    ? { publish: [{ provider: "generic", url: endpoint }] }
    : github
      ? {
          publish: [
            {
              provider: "github",
              owner: github.split("/")[0],
              repo: github.split("/")[1],
            },
          ],
        }
      : { publish: null }),
};
