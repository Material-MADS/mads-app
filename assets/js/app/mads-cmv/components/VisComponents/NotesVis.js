import React from "react";
import PropTypes from "prop-types";

const defaultOptions = {
  title: "",
  noteType: "None",
  noteColor: "#FFF7CC",
  textColor: "#000000",
  signature: "",
  content: "",
  created: "",
  modified: "",
  extent: {
    width: 400,
    height: 300,
  },
};

const htmlToPlainText = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return tmp.innerText || tmp.textContent || "";
};

const htmlToMarkdown = (html) => {
  let markdown = html || "";

  markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  markdown = markdown.replace(/<b>(.*?)<\/b>/gi, "**$1**");
  markdown = markdown.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  markdown = markdown.replace(/<i>(.*?)<\/i>/gi, "*$1*");
  markdown = markdown.replace(/<u>(.*?)<\/u>/gi, "_$1_");
  markdown = markdown.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  markdown = markdown.replace(/<li>(.*?)<\/li>/gi, "- $1\n");
  markdown = markdown.replace(/<\/ul>/gi, "\n");
  markdown = markdown.replace(/<\/ol>/gi, "\n");
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n");
  markdown = markdown.replace(/<\/p>/gi, "\n\n");
  markdown = markdown.replace(/<[^>]+>/g, "");

  const tmp = document.createElement("textarea");
  tmp.innerHTML = markdown;

  return tmp.value.trim();
};

const downloadTextFile = (filename, content) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const makeSafeFilename = (title, extension) => {
  const baseName = title && title.trim() !== "" ? title.trim() : "CADS_Notes";
  return `${baseName.replace(/[^a-z0-9_\-]+/gi, "_")}.${extension}`;
};

export default function Notes({ options }) {
  const internalOptions = {
    ...defaultOptions,
    ...(options || {}),
    extent: {
      ...defaultOptions.extent,
      ...((options && options.extent) || {}),
    },
  };

  const getNoteTypeBadgeStyle = (noteType) => {
    const colors = {
      Observation: { backgroundColor: "#DDEBFF", color: "#2458A6" },
      Hypothesis: { backgroundColor: "#E9DDFF", color: "#5B2FA6" },
      Conclusion: { backgroundColor: "#DFF3E3", color: "#2F7D45" },
      Warning: { backgroundColor: "#FFE1E1", color: "#A62F2F" },
      TODO: { backgroundColor: "#FFE8CC", color: "#A65F00" },
    };

    return {
      ...(colors[noteType] || { backgroundColor: "#EEEEEE", color: "#555555" }),
      padding: "2px 6px",
      borderRadius: "4px",
      fontWeight: "bold",
      fontSize: "11px",
    };
  };

  const exportTxt = () => {
    const lines = [];

    if (internalOptions.title) {
      lines.push(internalOptions.title);
      lines.push("");
    }

    lines.push(`Type: ${internalOptions.noteType || "None"}`);

    if (internalOptions.signature) {
      lines.push(`Signature: ${internalOptions.signature}`);
    }

    if (internalOptions.created) {
      lines.push(`Created: ${internalOptions.created}`);
    }

    if (internalOptions.modified) {
      lines.push(`Modified: ${internalOptions.modified}`);
    }

    lines.push("");
    lines.push(htmlToPlainText(internalOptions.content));

    downloadTextFile(
      makeSafeFilename(internalOptions.title, "txt"),
      lines.join("\n")
    );
  };

  const exportMarkdown = () => {
    const lines = [];

    if (internalOptions.title) {
      lines.push(`# ${internalOptions.title}`);
      lines.push("");
    }

    lines.push(`**Type:** ${internalOptions.noteType || "None"}`);

    if (internalOptions.signature) {
      lines.push(`**Signature:** ${internalOptions.signature}`);
    }

    if (internalOptions.created) {
      lines.push(`**Created:** ${internalOptions.created}`);
    }

    if (internalOptions.modified) {
      lines.push(`**Modified:** ${internalOptions.modified}`);
    }

    lines.push("");
    lines.push(htmlToMarkdown(internalOptions.content));

    downloadTextFile(
      makeSafeFilename(internalOptions.title, "md"),
      lines.join("\n")
    );
  };

  return (
    <div
      style={{
        width: internalOptions.extent.width || 300,
        height: internalOptions.extent.height || 300,
        boxSizing: "border-box",
        backgroundColor: internalOptions.noteColor || "#FFF7CC",
        color: internalOptions.textColor || "#000000",
        border: "1px solid rgba(0,0,0,0.25)",
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >

      <div
        style={{
          padding: "8px 10px",
          borderBottom: "1px solid rgba(0,0,0,0.2)",
          backgroundColor: "rgba(255,255,255,0.35)",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "2px" }}>
          {internalOptions.title || "Untitled Note"}
        </div>

        <div
          style={{
            fontSize: "11px",
            opacity: 0.75,
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {internalOptions.noteType && internalOptions.noteType !== "None" && (
            <span style={getNoteTypeBadgeStyle(internalOptions.noteType)}>
              [{internalOptions.noteType}]
            </span>
          )}

          {internalOptions.signature && (
            <span>Signed: {internalOptions.signature}</span>
          )}

          {internalOptions.created && (
            <span>Created: {internalOptions.created}</span>
          )}

          {internalOptions.modified && (
            <span>Modified: {internalOptions.modified}</span>
          )}
        </div>
      </div>

      <div
        style={{
          padding: "6px",
          borderBottom: "1px solid rgba(0,0,0,0.2)",
          backgroundColor: "rgba(255,255,255,0.25)",
          display: "flex",
          gap: "4px",
        }}
      >
        <button type="button" onClick={exportTxt} title="Export note as TXT">
          TXT
        </button>

        <button type="button" onClick={exportMarkdown} title="Export note as Markdown">
          MD
        </button>
      </div>

      <div
        style={{
          flexGrow: 1,
          padding: "10px",
          overflowY: "auto",
          fontSize: "14px",
          lineHeight: "1.45",
          backgroundColor: "rgba(255,255,255,0.1)",
        }}
        dangerouslySetInnerHTML={{
          __html: internalOptions.content || "<p><em>No note content yet.</em></p>",
        }}
      />

    </div>
  );
}

Notes.propTypes = {
  options: PropTypes.shape({
    title: PropTypes.string,
    noteType: PropTypes.string,
    noteColor: PropTypes.string,
    textColor: PropTypes.string,
    signature: PropTypes.string,
    content: PropTypes.string,
    created: PropTypes.string,
    modified: PropTypes.string,
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),
  }),
};

Notes.defaultProps = {
  options: defaultOptions,
};
