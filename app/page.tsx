import { DiscoveryScreen } from "@/features/restaurants/components/DiscoveryScreen";
import { detectedRestaurantId, nearbyRestaurants } from "@/features/restaurants/data/restaurants";

/** Screen 1 — Nikol restaurant discovery. */
export default function DiscoveryPage() {
  const detected =
    nearbyRestaurants.find((r) => r.id === detectedRestaurantId) ?? nearbyRestaurants[0];

  return <DiscoveryScreen detected={detected} nearby={nearbyRestaurants} />;
}
