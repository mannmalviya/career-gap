import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();
  const name = user?.firstName ?? user?.username ?? "there";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome, {name}.
        </h1>
        <p className="text-foreground/60 mt-1">
          You haven&apos;t run any analyses yet.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-foreground/15 p-10 flex flex-col items-center text-center gap-3">
        <p className="font-medium">Run your first Career-Gap analysis</p>
        <p className="text-sm text-foreground/60 max-w-md">
          Paste your resume and a target job description. You&apos;ll get a gap
          report and a roadmap to close it.
        </p>
        <button
          disabled
          className="rounded-full bg-foreground/20 text-background px-5 h-10 flex items-center font-medium cursor-not-allowed"
          title="Coming next"
        >
          New analysis (coming next)
        </button>
      </div>
    </div>
  );
}
