import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { ensureUser } from "@/lib/ensure-user";
import { ThemeToggle } from "@/components/theme-toggle";
import { updatePreferences } from "./actions";

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) return null;

  await ensureUser();

  const [row] = await db
    .select({ defaultHoursPerDay: users.defaultHoursPerDay })
    .from(users)
    .where(eq(users.clerkUserId, user.id))
    .limit(1);

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "—";
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Profile</h1>
        <p className="text-foreground/60 mt-1 text-sm">
          Identity comes from Clerk. Edit name, email, or password from the
          avatar menu.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-foreground/70 uppercase tracking-wide">
          Account
        </h2>
        <dl className="rounded-lg border border-foreground/10 divide-y divide-foreground/10">
          <Row label="Name" value={fullName || "—"} />
          <Row label="Email" value={email} />
          <Row
            label="Member since"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—"
            }
          />
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-foreground/70 uppercase tracking-wide">
          Preferences
        </h2>
        <form action={updatePreferences} className="flex flex-col gap-3">
          <label className="flex flex-col gap-2 max-w-xs">
            <span className="text-sm font-medium">Default hours per day</span>
            <input
              type="number"
              name="hours"
              min={1}
              max={16}
              defaultValue={row?.defaultHoursPerDay ?? ""}
              className="rounded-md border border-foreground/15 bg-transparent p-2 focus:outline-none focus:border-foreground/40"
            />
            <span className="text-xs text-foreground/50">
              Prefills the hours-per-day field when starting a new analysis.
              Leave blank to be asked each time.
            </span>
          </label>
          <div>
            <button
              type="submit"
              className="rounded-full bg-foreground text-background px-5 h-10 flex items-center font-medium hover:opacity-90"
            >
              Save
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-2 pt-4 border-t border-foreground/10">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle />
          <span className="text-xs text-foreground/50">
            Choose Light, Dark, or follow your system setting.
          </span>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4 px-4 py-3">
      <dt className="text-sm text-foreground/60 w-32 shrink-0">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
