import assert from "node:assert/strict";
import test from "node:test";
import { describeAgent, deviceLabel } from "../src/lib/user-agent";

const CHROME_WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const EDGE_WINDOWS = `${CHROME_WINDOWS} Edg/126.0.0.0`;
const FIREFOX_LINUX = "Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const CHROME_ANDROID =
  "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";

const CHROME_ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const SAFARI_IPAD =
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

test("a browser that also says Chrome or Safari is named by its own token", () => {
  assert.equal(deviceLabel(describeAgent(EDGE_WINDOWS)), "Edge on Windows");
  assert.equal(deviceLabel(describeAgent(CHROME_WINDOWS)), "Chrome on Windows");
  assert.equal(deviceLabel(describeAgent(SAFARI_IPHONE)), "Safari on iOS");
});

test("Android counts as Android and not as Linux", () => {
  assert.equal(deviceLabel(describeAgent(CHROME_ANDROID)), "Chrome on Android");
  assert.equal(deviceLabel(describeAgent(FIREFOX_LINUX)), "Firefox on Linux");
});

test("phones, tablets and desktops get their own kind", () => {
  assert.equal(describeAgent(CHROME_ANDROID).kind, "phone");
  assert.equal(describeAgent(SAFARI_IPHONE).kind, "phone");
  assert.equal(describeAgent(CHROME_ANDROID_TABLET).kind, "tablet");
  assert.equal(describeAgent(SAFARI_IPAD).kind, "tablet");
  assert.equal(describeAgent(CHROME_WINDOWS).kind, "desktop");
});

test("a missing or odd user agent still gives a readable label", () => {
  assert.equal(deviceLabel(describeAgent(null)), "Unknown browser on Unknown system");
  assert.equal(deviceLabel(describeAgent("curl/8.4.0")), "Unknown browser on Unknown system");
});
