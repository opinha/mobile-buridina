import React from "react";

export function TribalBorder() {
  return (
    <div className="w-full h-2 shadow-sm" style={{
      backgroundImage: `url('data:image/svg+xml;utf8,<svg width="40" height="8" viewBox="0 0 40 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 4L5 0L10 4L15 0L20 4V8L15 4L10 8L5 4L0 8V4Z" fill="%23D4691E" /><path d="M20 4L25 0L30 4L35 0L40 4V8L35 4L30 8L25 4L20 8V4Z" fill="%238B6347" /></svg>')`,
      backgroundRepeat: "repeat-x"
    }} />
  );
}
