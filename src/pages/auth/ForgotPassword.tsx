import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20 px-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-light text-foreground mb-4 text-center">Resetare parolă</h1>
          
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Am trimis un email cu instrucțiunile de resetare la <strong>{email}</strong>. Verifică-ți inbox-ul.
              </p>
              <Link to="/login" className="text-sm text-foreground hover:underline">
                Înapoi la autentificare
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Introdu adresa de email asociată contului tău și îți vom trimite un link de resetare.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-light">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplu@email.com"
                    required
                    maxLength={255}
                    className="rounded-none"
                  />
                </div>
                <Button type="submit" className="w-full rounded-none" size="lg" disabled={loading}>
                  {loading ? "Se trimite..." : "Trimite link de resetare"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-8">
                <Link to="/login" className="text-foreground hover:underline">
                  Înapoi la autentificare
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
