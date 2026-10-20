"use client";

import { PLATFORMS } from "@/lib/webhook-platforms";
import { Modal } from "../modal";
import { WebhookIcon } from "./webhook-icon";

export function PlatformsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} wide title="Supported platforms" onClose={onClose}>
      <p className="dialog__text">
        Paste the URL and minelog picks the right format for you. Each platform
        gets its alerts the way it displays them best.
      </p>
      <ul className="dash-platforms">
        {PLATFORMS.map((platform) => (
          <li key={platform.kind} className="dash-platforms__item">
            <WebhookIcon kind={platform.kind} size={20} />
            <div className="dash-platforms__body">
              <p className="dash-platforms__name">{platform.name}</p>
              <p className="dash-platforms__text">{platform.where}</p>
              <p className="dash-platforms__text">
                <code className="dash-form__code">{platform.looks}</code>
              </p>
              <p className="dash-platforms__text">{platform.note}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="dialog__actions">
        <button type="button" className="button button--sm" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}
