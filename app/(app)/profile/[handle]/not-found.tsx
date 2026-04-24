import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-display font-semibold">Profile not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn&apos;t find an angler with that handle.
      </p>
      <Button asChild variant="primary" size="sm" className="mt-6">
        <Link href="/friends">Find people</Link>
      </Button>
    </div>
  );
}
