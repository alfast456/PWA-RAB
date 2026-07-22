import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/wedding");
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Wedding RAB Planner</CardTitle>
          <CardDescription>
            Rencana Anggaran Biaya Pernikahan untuk wedding planner kalian bersama.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Daftar</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
