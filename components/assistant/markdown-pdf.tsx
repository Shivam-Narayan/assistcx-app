import { SourceDocument } from "@/app/assistant/chat/_components/types";
import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import React from "react";
import { MarkdownToPdfProps } from "./types";

const styles = StyleSheet.create({
  page: { padding: 30 },
  heading1: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  heading2: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  heading3: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  paragraph: { fontSize: 12, lineHeight: 1.5, marginBottom: 8 },
  listItem: { flexDirection: "row", marginBottom: 4 },
  listBullet: { width: 10, fontSize: 12, lineHeight: 1.5, marginRight: 4 },
  listContent: { flex: 1, fontSize: 12, lineHeight: 1.5 },
  link: { color: "blue", textDecoration: "underline" },
  strong: { fontWeight: "bold" },
  em: { fontStyle: "italic" },

  // --- Table styles ---
  table: { width: "auto", marginBottom: 10 },
  tableRow: { flexDirection: "row" },
  tableColHeader: {
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f0f0f0",
    padding: 4,
    flex: 1,
  },
  tableCol: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 4,
    flex: 1,
  },
  tableCellHeader: { fontSize: 12, fontWeight: "bold" },
  tableCell: { fontSize: 12 },

  // --- Q&A styles ---
  qaBlock: {},
  questionLabel: { fontSize: 12, fontWeight: "bold", marginRight: 4 },
  question: { fontSize: 20, fontWeight: "bold" },
  answerLabel: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  answerContent: { marginLeft: 12 },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginVertical: 8,
    marginBottom: 18,
  },

  // second design
  timeStampBlock: {
    textAlign: "left",
  },
  timestamp: {
    textAlign: "left",
    fontSize: 12,
    marginTop: 10,
  },
});

// --- Inline Markdown parser for bold, italic, and links ---
const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\))/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`${keyPrefix}-plain-${key++}`}>
          {text.slice(lastIndex, match.index)}
        </Text>,
      );
    }
    if (match[2]) {
      parts.push(
        <Text key={`${keyPrefix}-bold-${key++}`} style={styles.strong}>
          {match[2]}
        </Text>,
      );
    } else if (match[3]) {
      parts.push(
        <Text key={`${keyPrefix}-italic-${key++}`} style={styles.em}>
          {match[3]}
        </Text>,
      );
    } else if (match[4] && match[5]) {
      parts.push(
        <Link
          key={`${keyPrefix}-link-${key++}`}
          src={match[5]}
          style={styles.link}
        >
          {match[4]}
        </Link>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(
      <Text key={`${keyPrefix}-plain-last`}>{text.slice(lastIndex)}</Text>,
    );
  }
  return parts;
};

// --- Detect and render tables ---
const renderTable = (lines: string[], startIndex: number) => {
  const rows: string[][] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("|") || line.length < 3) break;

    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c !== "");

    rows.push(cells);
  }

  if (rows.length < 2) return { table: null, nextIndex: startIndex };

  const header = rows[0];
  const body = rows.slice(2); // skip separator row

  return {
    table: (
      <View style={styles.table} key={`table-${startIndex}`}>
        {/* Header */}
        <View style={styles.tableRow}>
          {header.map((cell, ci) => (
            <View key={`header-${ci}`} style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>
                {renderInline(cell, `header-${ci}`)}
              </Text>
            </View>
          ))}
        </View>

        {/* Body */}
        {body.map((row, ri) => (
          <View style={styles.tableRow} key={`row-${ri}`}>
            {row.map((cell, ci) => (
              <View key={`cell-${ri}-${ci}`} style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {renderInline(cell, `cell-${ri}-${ci}`)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    ),
    nextIndex: startIndex + rows.length,
  };
};

export const MarkdownToPdf: React.FC<MarkdownToPdfProps> = ({
  content,
  question,
  timeStamp,
  sources,
}) => {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  if (question) {
    elements.push(
      <View key="question-block" style={styles.qaBlock}>
        <Text style={styles.question}>{question}</Text>
      </View>,
    );
  }

  if (timeStamp) {
    elements.push(
      <View key="timestamp" style={styles.timeStampBlock}>
        <Text style={styles.timestamp}>{timeStamp}</Text>
      </View>,
    );
  }

  if (question && content) {
    elements.push(<View key="divider" style={styles.divider} />);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table
    if (line.startsWith("|")) {
      const { table, nextIndex } = renderTable(lines, i);
      if (table) {
        elements.push(table);
        i = nextIndex - 1;
        continue;
      }
    }

    // Headings
    if (line.startsWith("# ")) {
      elements.push(
        <Text key={i} style={styles.heading1}>
          {renderInline(line.substring(2), `h1-${i}`)}
        </Text>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <Text key={i} style={styles.heading2}>
          {renderInline(line.substring(3), `h2-${i}`)}
        </Text>,
      );
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <Text key={i} style={styles.heading3}>
          {renderInline(line.substring(4), `h3-${i}`)}
        </Text>,
      );
      continue;
    }

    // List
    if (line.startsWith("- ")) {
      elements.push(
        <View key={i} style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>
            {renderInline(line.substring(2), `li-${i}`)}
          </Text>
        </View>,
      );
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      elements.push(<View key={i} style={{ height: 8 }} />);
      continue;
    }

    // Paragraph
    elements.push(
      <Text key={i} style={styles.paragraph}>
        {renderInline(line, `p-${i}`)}
      </Text>,
    );
  }

  if (sources && sources?.length > 0) {
    elements.push(
      <View key="sources" style={{ marginTop: 20 }}>
        <Text style={styles.heading2}>Citations</Text>
        {sources.map((source, index) => (
          <Text key={index} style={styles.paragraph}>
            [{index + 1}] - {source.title}{" "}
            {source?.url && (
              <Link href={source.url} style={styles.link}>
                {source.url}
              </Link>
            )}
          </Text>
        ))}
      </View>,
    );
  }

  return <View>{elements}</View>;
};
export const MarkdownPdf = ({
  content,
  question,
  timeStamp,
  sources,
}: {
  content: string;
  question: string | undefined;
  timeStamp: string | undefined;
  sources: SourceDocument[];
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <MarkdownToPdf
        content={content}
        question={question ?? ""}
        timeStamp={timeStamp}
        sources={sources}
      />
    </Page>
  </Document>
);
