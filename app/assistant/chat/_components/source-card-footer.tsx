import Image from "next/image";
import Link from "next/link";
import { footerProps, SourceDocument } from "./types";
import { Download, SquareArrowOutUpRight } from "lucide-react";

const getDomain = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const getFaviconUrl = (url: string) => {
  try {
    const { origin } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=16`;
  } catch {
    return null;
  }
};

export function SourceCardFooter({
  source,
  handleDownload,
  className,
}: footerProps) {
  const faviconUrl =
    source?.source_type === "web_page" && source?.url
      ? getFaviconUrl(source.url)
      : null;

  return (
    <div
      className={`flex items-center gap-8 justify-between p-2  border-t rounded-b-lg ${className}`}
    >
      <span className="px-1.5 py-0.5 rounded text-xs text-muted-foreground font-medium flex-1 truncate overflow-hidden whitespace-nowrap flex items-center gap-1.5">
        {source?.source_type === "web_page" && source?.url && (
          <>
            {faviconUrl && (
              <Image
                src={faviconUrl}
                alt=""
                width={14}
                height={14}
                className="rounded-sm shrink-0"
                unoptimized
              />
            )}
            <span className="truncate">{getDomain(source.url)}</span>
          </>
        )}
        {source?.source_type === "pdf" ||
          (source?.source_type === "doc_chunk" && source?.metadata?.file_name)}
      </span>
      <span className="min-content">
        {source?.source_type == "web_page" && (
          <Link href={`${source?.url}`} target="_blank">
            <div className="flex items-center gap-1.5 cursor-pointer border px-2 py-0.5 text-muted-foreground font-medium rounded text-xs whitespace-nowrap hover:bg-muted">
              <SquareArrowOutUpRight strokeWidth={2.5} className="w-3 h-3" />
              Visit Link
            </div>
          </Link>
        )}
        {source?.source_type == "pdf" ||
          (source?.source_type == "doc_chunk" && (
            <div
              onClick={handleDownload}
              className="flex items-center gap-1.5 cursor-pointer border px-2 py-0.5 text-muted-foreground font-medium rounded text-xs whitespace-nowrap hover:bg-muted"
            >
              <Download strokeWidth={2.5} className="w-3 h-3" />
              Download
            </div>
          ))}
      </span>
    </div>
  );
}
