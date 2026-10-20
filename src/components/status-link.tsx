"use client";

import { useEffect, useState } from "react";
import { STATUS_URL } from "@/lib/config";
import { STATUS_LABEL, type PublicStatus } from "@/lib/status";

export function StatusLink() {
  const [state, setState] = useState<PublicStatus>("unknown");

  useEffect(() => {
    let live = true;
    fetch("/api/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { state?: PublicStatus } | null) => {
        if (live && body?.state) setState(body.state);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return (
    <a
      href={STATUS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="footer-link status-link"
      data-tip={STATUS_LABEL[state]}
    >
      <span className={`status-link__dot status-link__dot--${state}`} aria-hidden="true" />
      Status
    </a>
  );
}
