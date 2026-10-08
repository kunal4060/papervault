// Inline SVG icons — no emoji in UI.
const paths = {
  search: <path d="M11 4a7 7 0 1 0 4.9 12L21 21l-1.4 1.4-5.1-5.1A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />,
  download: <path d="M12 3v10.6l3.3-3.3 1.4 1.4-5.7 5.7-5.7-5.7 1.4-1.4 3.3 3.3V3h2ZM5 19h14v2H5v-2Z" />,
  eye: <path d="M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7Zm0 2C8.2 7 5 10 3.6 12 5 14 8.2 17 12 17s7-3 8.4-5C19 10 15.8 7 12 7Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />,
  upload: <path d="M12 16V5.4L8.7 8.7 7.3 7.3 12 2.6l4.7 4.7-1.4 1.4L12 5.4V16h-2ZM5 19h14v2H5v-2Z" />,
  clock: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5h-2v6l5 3 1-1.7-4-2.3V7Z" />,
  file: <path d="M6 2h8l5 5v15H6V2Zm7 1.5V8h4.5L13 3.5ZM8 12h8v2H8v-2Zm0 4h8v2H8v-2Z" />,
  chevR: <path d="m9 6 6 6-6 6-1.4-1.4L12.2 12 7.6 7.4 9 6Z" />,
  menu: <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />,
  close: <path d="m6 6 1.4-1.4L12 9.2l4.6-4.6L18 6l-4.6 4.6L18 15.2 16.6 16.6 12 12l-4.6 4.6L6 15.2 10.6 10.6 6 6Z" />,
  spark: <path d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2Zm0 4.2 1.3 3.8 3.8 1.3-3.8 1.3L12 16.4l-1.3-3.8-3.8-1.3 3.8-1.3L12 6.2Z" />,
  share: <path d="M14 5V2L21 7l-7 5V9c-4 0-6.5 1.5-8.5 4.5C4.5 10 7 6.5 14 5ZM7 15c1.5 2 4 3.5 9 3.5v2H5v-7l2 1.5Z" />,
  bookmark: <path d="M7 3h10v18l-5-3.5L7 21V3Z" />,
  check: <path d="m9.5 15.2-4-4L4 12.7l5.5 5.5 11-11L19 5.7l-9.5 9.5Z" />,
  send: <path d="M3 20v-6l8-2-8-2V4l19 8-19 8Zm2.7-8.4L17 12 5.7 12.4 5.6 14.6V20l.1-2.4Zm0 0" />,
  paperclip: <path d="m16.8 3.9 4.1 4.1-8.9 8.9a3.7 3.7 0 0 1-5.3-5.2l7.7-7.8 1.4 1.4-7.7 7.8a1.7 1.7 0 0 0 2.4 2.4l8.9-8.9-1.4-1.4-3.5 3.5 1.4 1.4 3.5-3.5-4.1-4.1-1.5 1.4Z" />,
  image: <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 2v14h14V5H5Zm3.5 2.5A1.5 1.5 0 1 1 8.5 10 1.5 1.5 0 0 1 8.5 7.5ZM6 17.4l4.5-4.5 3.5 3.5 2-2 2.5 2.5V19H6v-1.6Z" />,
  trash: <path d="M9 3h6l1 2h5v2H3V5h5l1-2Zm-3 6h12l-1 12H7L6 9Zm2 2v8h1.4v-8H8Zm4.6 0v8h1.4v-8h-1.4Z" />,
  thumbsup: <path d="M4 20V10h3.5l-.7 8.6L4 20Zm2-9.5h2.2l1.5-4.3 1.8.8-.9 3.5H15a2 2 0 0 1 2 2.4l-1.3 6.2H8.4L6 20.5V10.5ZM17 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" />,
};

export default function Icon({ name, size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? null}
    </svg>
  );
}
