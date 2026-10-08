import React, { useState } from "react";
import { storageKey } from "./runtime";
export default function OfflineHelp() {
  const key = storageKey("sewestian-question-draft");
  const [message, setMessage] = useState(() => localStorage.getItem(key) || "");
  const [saved, setSaved] = useState(false);
  function save(e) {
    e.preventDefault();
    localStorage.setItem(key, message);
    setSaved(true);
  }
  function download() {
    const blob = new Blob([message], { type: "text/plain" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "sewestian-question.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  return (
    <section className="support-page">
      <h1>Your question notebook</h1>
      <p>
        This APK is offline. Questions saved here stay on this phone and are not
        sent to your teacher.
      </p>
      <form className="support-card" onSubmit={save}>
        <label>
          Your doubt or feedback
          <textarea
            rows={10}
            maxLength={5000}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSaved(false);
            }}
          />
        </label>
        <button className="button primary">Save on this phone</button>{" "}
        <button
          className="button"
          type="button"
          disabled={!message.trim()}
          onClick={download}
        >
          Export question as text
        </button>
        {saved && (
          <p role="status">Saved on this phone. Not sent to your teacher.</p>
        )}
      </form>
      <p>
        Export the text and send it using your usual contact method, or show
        your teacher the phone. Teacher replies and shared accounts require a
        connected website.
      </p>
    </section>
  );
}
