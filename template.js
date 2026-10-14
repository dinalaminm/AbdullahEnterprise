export default function Template({ children }) {
  // re-mounts on every navigation -> plays the page fade-in
  return <div className="page-enter">{children}</div>;
}
