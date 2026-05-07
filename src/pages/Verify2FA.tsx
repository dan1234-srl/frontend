import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Verify2FA = () => {
  const [code, setCode] = useState("");
  const { verify2FA } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Recuperăm token-ul temporar pasat de la Login
  const tempToken = location.state?.tempToken;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) {
      toast.error("Sesiune expirată. Autentifică-te din nou.");
      return navigate("/");
    }

    const { error } = await verify2FA(code, tempToken);
    if (!error) {
      toast.success("Acces Aprobat.");
      navigate("/account/profile"); // Sau unde vrei să meargă
    } else {
      toast.error("Cod incorect sau expirat.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full space-y-12 text-center">
        <h2 className="text-3xl font-serif italic text-[#050B18]">
          Vault Access
        </h2>
        <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400">
          Introduceți codul generat de aplicația Google Authenticator
        </p>
        <form onSubmit={handleSubmit} className="space-y-10">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center text-4xl tracking-[0.6em] border-b border-neutral-100 outline-none py-4 font-light focus:border-[#050B18] transition-colors bg-transparent"
            autoFocus
          />
          <button className="w-full bg-[#050B18] text-white py-6 uppercase text-[10px] font-black tracking-[0.4em] hover:bg-neutral-800 transition-all">
            Unlock Profile
          </button>
        </form>
      </div>
    </div>
  );
};
