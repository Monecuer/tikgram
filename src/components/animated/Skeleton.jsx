import { cx } from "../../lib/cx";

export default function Skeleton({ className }) {
  return (
    <div className={cx("animate-pulse bg-white/5 rounded-xl", className)} />
  );
}
