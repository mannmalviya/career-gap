import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { resumes, users } from "@/db/schema";
import { ensureUser } from "@/lib/ensure-user";
import { ThemeToggle } from "@/components/theme-toggle";
import { ResumeInput } from "@/components/resume-input";
import { ToastForm } from "@/components/toast-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { removeDefaultResume, setDefaultResume } from "./actions";

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) return null;

  await ensureUser();

  const [row] = await db
    .select({ defaultResumeId: users.defaultResumeId })
    .from(users)
    .where(eq(users.clerkUserId, user.id))
    .limit(1);

  let defaultResumeText = "";
  if (row?.defaultResumeId) {
    const [r] = await db
      .select({ rawText: resumes.rawText })
      .from(resumes)
      .where(eq(resumes.id, row.defaultResumeId))
      .limit(1);
    if (r) defaultResumeText = r.rawText;
  }

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "-";
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
          <Row label="Name" value={fullName || "-"} />
          <Row label="Email" value={email} />
          <Row
            label="Member since"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "-"
            }
          />
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-foreground/70 uppercase tracking-wide">
          Preferences
        </h2>
        <ToastForm
          action={setDefaultResume}
          successMessage="Resume updated"
          className="flex flex-col gap-3"
        >
          <span className="text-sm font-medium">Default resume</span>
          <ResumeInput
            key={row?.defaultResumeId ?? "empty"}
            name="resume"
            initialText={defaultResumeText}
          />
          <span className="text-xs text-foreground/50">
            Prefills the resume field on new analyses. Replace any time to
            update.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="shine rounded-full bg-foreground text-background px-5 h-10 flex items-center font-medium hover:opacity-90"
            >
              {defaultResumeText ? "Update resume" : "Save resume"}
            </button>
          </div>
        </ToastForm>

        {defaultResumeText && (
          <ToastForm
            action={removeDefaultResume}
            successMessage="Resume removed"
          >
            <ConfirmDialog
              title="Remove saved resume?"
              body="Your saved resume will be cleared from your profile. Past analyses keep their copy. You can upload a new one any time."
              confirmLabel="Remove"
              triggerClassName="text-sm text-foreground/50 hover:text-red-500 transition-colors"
            >
              Delete saved resume
            </ConfirmDialog>
          </ToastForm>
        )}

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
