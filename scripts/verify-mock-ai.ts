/* Ad-hoc check of the mock AI + ordering logic. Run: npx tsx scripts/verify-mock-ai.ts */
import { nikolAI } from "@/services/ai";
import { orderTotal, preOrderCheck, splitBill } from "@/services/ordering/order-service";
import { estimateMinutes, formatEstimate } from "@/services/kitchen/estimate";
import { createDemoSession } from "@/features/table/data/table-session";

const R = "loama";

async function main() {
  const byQuestions = await nikolAI.recommend(
    { mood: "light", preference: "fish", restrictions: ["lactose-free"], allergies: [] },
    R,
  );
  console.log("קל + דג + ללא לקטוז:");
  byQuestions.forEach((r) => console.log(`  ${r.dish.name} ₪${r.dish.price} — ${r.reason}`));

  const byText = await nikolAI.recommendFromText(
    "בא לי משהו קל, אולי דג, אבל בלי שמנת",
    R,
  );
  console.log("\nטקסט חופשי:");
  byText.forEach((r) => console.log(`  ${r.dish.name} ₪${r.dish.price}`));

  console.log("\nשאלות על מנה:");
  for (const q of ["זה חריף?", "יש בזה גלוטן?", "זה מספיק לאדם אחד?"]) {
    const a = await nikolAI.ask(q, R, "hamburger");
    console.log(`  ${q} → ${a.text}`);
  }

  const cmp = await nikolAI.compare("lemon-pasta", "mushroom-risotto", R);
  console.log(`\nהשוואה: ${cmp.verdict}`);

  const up = await nikolAI.upsell(["hamburger"], R);
  console.log(`\nUpsell: ${up?.message}`);

  const session = createDemoSession(R, 12);
  console.log(`\nסה״כ שולחן: ₪${orderTotal(session.items)}`);
  console.log(`זמן משוער: ${formatEstimate(estimateMinutes(session.items, R))}`);
  console.log(`בדיקה לפני שליחה: ${preOrderCheck(session, R) ?? "הכל תקין"}`);
  console.log("חלוקה שווה:", splitBill(session, "equal"));
  console.log("לפי אדם:", splitBill(session, "per-person"));
}

main();
