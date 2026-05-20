import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  parseChatContent,
  splitLineWithPaths,
  sanitizeChatPlainText,
} from "@/lib/homepage-chat-format";
import { chatPathHref, chatPathLabel } from "@/lib/homepage-chat-paths";

type HomepageChatMessageBodyProps = {
  content: string;
  variant: "user" | "assistant";
};

function PathLink({ path, inverted }: { path: string; inverted?: boolean }) {
  return (
    <Link
      href={chatPathHref(path)}
      className={cn(
        "font-semibold underline underline-offset-2",
        inverted
          ? "text-white decoration-white/60"
          : "text-blue-700 decoration-blue-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-sm",
      )}
    >
      {chatPathLabel(path)}
    </Link>
  );
}

function InlineLine({
  line,
  inverted,
  as = "p",
}: {
  line: string;
  inverted?: boolean;
  as?: "p" | "span";
}) {
  const segments = splitLineWithPaths(line);
  const Tag = as;
  return (
    <Tag className="text-[0.9375rem] leading-relaxed break-words">
      {segments.map((seg, i) =>
        seg.type === "path" ? (
          <PathLink key={`${i}-${seg.value}`} path={seg.value} inverted={inverted} />
        ) : (
          <span key={i}>{seg.value}</span>
        ),
      )}
    </Tag>
  );
}

export default function HomepageChatMessageBody({
  content,
  variant,
}: HomepageChatMessageBodyProps) {
  if (variant === "user") {
    const lines = sanitizeChatPlainText(content).split("\n").filter(Boolean);
    return (
      <div className="space-y-1 text-white">
        {lines.map((line, i) => (
          <InlineLine key={i} line={line} inverted as="p" />
        ))}
      </div>
    );
  }

  const blocks = parseChatContent(content);

  return (
    <div className="space-y-2.5">
      {blocks.map((block, bi) => {
        if (block.type === "list") {
          return (
            <ol
              key={bi}
              className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-slate-700"
            >
              {block.items.map((item, ii) => (
                <li key={ii} className="break-words pl-0.5">
                  <InlineLine line={item} as="span" />
                </li>
              ))}
            </ol>
          );
        }
        return (
          <div key={bi} className="space-y-1">
            {block.lines.map((line, li) => (
              <InlineLine key={li} line={line} as="p" />
            ))}
          </div>
        );
      })}
    </div>
  );
}
