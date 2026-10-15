import type { Rule } from "../types";

const PATTERN =
  /PKIX path building failed|unable to find valid certification path to requested target|SunCertPathBuilderException/;

export const sslCertificate: Rule = {
  id: "ssl-certificate",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "pkix",
      message: "Java doesn't trust the security certificate of a site it tried to reach.",
      solutions: [
        "Update Java. An old Java doesn't know newer root certificates. Use the Java your launcher bundles, or a current Java 17 or 21.",
        "Antivirus programs that scan HTTPS, school or work networks and some proxies swap the certificate. Turn that scanning off for Java, or try another network.",
        "Check that the computer's date and time are right. A wrong clock makes valid certificates look expired.",
      ],
    };
  },
};
