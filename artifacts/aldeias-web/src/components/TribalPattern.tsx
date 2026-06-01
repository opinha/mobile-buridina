import React from "react";

export function TribalPattern({ color = "#4A2B18" }: { color?: string }) {
  return (
    <div className="w-full relative h-[6px] opacity-70 mt-1 mb-2 overflow-hidden flex" style={{
      backgroundImage: `url('data:image/svg+xml;utf8,<svg width="20" height="6" viewBox="0 0 20 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 3L5 0L10 3L15 0L20 3V6L15 3L10 6L5 3L0 6V3Z" fill="%234A2B18"/></svg>')`,
      backgroundRepeat: "repeat-x"
    }} />
  );
}
