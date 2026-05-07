import { useState } from "react";

import Login from "@/pages/auth/Login";
import ForgotPasswordDrawer from "@/pages/auth/ForgotPasswordDrawer";

// dacă ai register:
import RegisterDrawer from "@/pages/auth/RegisterDrawer";

interface AuthModalsProps {
  loginOpen: boolean;
  setLoginOpen: (value: boolean) => void;
}

const AuthModals = ({ loginOpen, setLoginOpen }: AuthModalsProps) => {
  const [forgotOpen, setForgotOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      {/* LOGIN */}
      <Login
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);

          setTimeout(() => {
            setRegisterOpen(true);
          }, 150);
        }}
        onOpenForgot={() => {
          setLoginOpen(false);

          setTimeout(() => {
            setForgotOpen(true);
          }, 150);
        }}
      />

      {/* FORGOT PASSWORD */}
      <ForgotPasswordDrawer
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onBackToLogin={() => {
          setForgotOpen(false);

          setTimeout(() => {
            setLoginOpen(true);
          }, 150);
        }}
      />

      {/* REGISTER */}
      <RegisterDrawer
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onBackToLogin={() => {
          setRegisterOpen(false);

          setTimeout(() => {
            setLoginOpen(true);
          }, 150);
        }}
      />
    </>
  );
};

export default AuthModals;
