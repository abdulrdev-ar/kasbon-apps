import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignupForm } from "./form";

export const metadata = { title: "Daftar · Kasbon" };

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">Bikin akun Kasbon</CardTitle>
        <CardDescription>
          Catat utang piutang biar tidak lupa siapa pinjam berapa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
