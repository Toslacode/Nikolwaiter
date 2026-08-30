import { nearbyRestaurants } from "@/features/restaurants/data/restaurants";

/**
 * Restaurant discovery (Screen 1).
 *
 * Placeholder only — the approved reference screenshot for this screen has not
 * been readable yet, and the brief requires a 1:1 recreation of it. This stub
 * exists so the route and its data wiring can be verified in the meantime.
 */
export default function DiscoveryPage() {
  return (
    <main>
      <h1>Nikol</h1>
      <p>המלצרית החכמה שלכם</p>
      <p>מסך בחירת מסעדה — ממתין לעיצוב לפי תמונות הייחוס.</p>
      <ul>
        {nearbyRestaurants.map((restaurant) => (
          <li key={restaurant.id}>
            {restaurant.name} — {restaurant.distanceKm} ק״מ
          </li>
        ))}
      </ul>
    </main>
  );
}
