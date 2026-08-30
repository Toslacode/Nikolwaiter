import { loama } from "@/features/restaurants/data/restaurants";

/**
 * Restaurant dashboard prototype. Intentionally plain — the brief puts the
 * design effort on the customer experience, not here.
 */
export default function AdminPage() {
  const metrics = [
    { label: "משתמשים ב-Nikol", value: "1,284" },
    { label: "הזמנות דרך Nikol", value: "412" },
    { label: "סכום הזמנה ממוצע", value: "₪243" },
    { label: "Upsell", value: "31%" },
    { label: "שביעות רצון", value: "4.6 / 5" },
  ];

  return (
    <main>
      <h1>{loama.name} — לוח בקרה</h1>

      <section>
        <h2>מדדים</h2>
        <ul>
          {metrics.map((metric) => (
            <li key={metric.label}>
              {metric.label}: {metric.value}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>תפריט ({loama.dishes.length} מנות)</h2>
        <ul>
          {loama.dishes.map((dish) => (
            <li key={dish.id}>
              {dish.name} — ₪{dish.price} — {dish.available ? "זמין" : "לא זמין"}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
