export default function Logo({ light = false }) {
  return <span className={`wordmark ${light ? 'light' : ''}`}>shaupex<i /></span>;
}
