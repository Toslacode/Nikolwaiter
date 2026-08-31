/**
 * A template (rather than a layout) re-mounts on every navigation within the
 * restaurant, which is what lets each screen play its arrival animation instead
 * of hard-cutting into place. Reduced-motion users get the same layout with the
 * animation switched off in globals.css.
 */
export default function RestaurantScreenTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="screen-enter">{children}</div>;
}
