import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import nprogress from "nprogress";
import "nprogress/nprogress.css";

// Adaugă acest stil în index.css pentru a o face ultra-fină
// #nprogress .bar { background: #000 !important; height: 1px !important; }

const LoadingBar = () => {
  const location = useLocation();

  useEffect(() => {
    nprogress.start();
    nprogress.done();
  }, [location]);

  return null;
};

export default LoadingBar;
