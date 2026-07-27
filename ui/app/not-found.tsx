import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-500 text-sm">404</p>
        <h1 className="mt-2 font-semibold text-2xl text-slate-950">
          Page not found
        </h1>
        <p className="mt-3 text-slate-500 text-sm">
          The page you are looking for does not exist.
        </p>
        <Link
          className="mt-6 inline-flex rounded-xl bg-slate-950 px-4 py-2 font-medium text-sm text-white"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
