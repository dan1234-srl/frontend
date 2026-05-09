import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  fetchUserData: () => Promise<boolean>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    birthday: string,
    gender: string,
    phone: string,
  ) => Promise<{ error: any }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: any; requires2FA?: boolean; tempToken?: string }>;
  verify2FA: (code: string, tempToken: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  // Funcția adăugată pentru resetarea parolei
  resetPassword: (
    email: string,
    code?: string,
  ) => Promise<{ error: any; requires2FA?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAdmin(userData.role === "admin");
        return true;
      }
      setUser(null);
      setIsAdmin(false);
      return false;
    } catch (error) {
      console.error("Critical Auth Sync Error:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await fetchUserData();
      setIsLoading(false);
    };
    initAuth();
  }, [fetchUserData]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.detail || "Credentials rejection.");
        if (data.requires_2fa)
          return { error: null, requires2FA: true, tempToken: data.temp_token };

        await fetchUserData();
        return { error: null, requires2FA: false };
      } catch (error: any) {
        return { error: { message: error.message } };
      }
    },
    [fetchUserData],
  );

  const verify2FA = useCallback(
    async (code: string, tempToken: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/auth/2fa/verify-login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, temp_token: tempToken }),
            credentials: "include",
          },
        );
        if (!response.ok) throw new Error("Verification failed.");
        await fetchUserData();
        return { error: null };
      } catch (error: any) {
        return { error: { message: error.message } };
      }
    },
    [fetchUserData],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      birthday: string,
      gender: string,
      phone: string,
    ) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            birthday,
            gender,
            phone,
          }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.detail || "Registration denied.");
        return { error: null };
      } catch (error: any) {
        return { error: { message: error.message } };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem("user_session_info");
      window.location.href = "/";
    }
  }, []);

  // Funcția adăugată pentru Forgot Password (suportă 2FA)
  const resetPassword = useCallback(async (email: string, code?: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            code: code?.trim(),
          }),
        },
      );

      const data = await response.json();

      // Dacă serverul raportează că user-ul are 2FA activ, dar nu l-am trimis încă
      if (response.status === 403 && data.requires_2fa) {
        return { error: null, requires2FA: true };
      }

      if (!response.ok) {
        throw new Error(data.detail || "Eroare la resetare.");
      }

      return { error: null, requires2FA: false };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        signUp,
        signIn,
        verify2FA,
        signOut,
        fetchUserData,
        resetPassword, // <- Adăugată aici
      }}
    >
      {!isLoading ? (
        children
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
          <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            Evem Luxury Retail
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
