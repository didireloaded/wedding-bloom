import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="couple-app flex min-h-screen items-center justify-center bg-[#f1f1f1] p-5">
      <div className="w-full max-w-sm rounded-[28px] bg-white p-7 text-center shadow-sm">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-flex min-h-11 items-center rounded-full bg-[#202020] px-5 text-sm font-semibold text-white">
          Return home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
