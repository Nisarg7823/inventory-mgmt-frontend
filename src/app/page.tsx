import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Landing() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-white to-black/5 dark:from-black dark:via-black dark:to-white/5">
      <Card className="w-full max-w-xl">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto h-12 w-12 rounded-xl bg-foreground text-background grid place-items-center text-xl">IM</div>
          </div>
          <h1 className="text-3xl font-semibold mb-2">Inventory Management</h1>
          <p className="text-base opacity-80 mb-8">Welcome! Please login or sign up to continue.</p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
