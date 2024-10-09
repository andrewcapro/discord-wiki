import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import "@/styles/globals.css";
import Loading from "./loading";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ProtectedRoute Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

const ProtectedRoute = ({
  Component,
  pageProps,
}: {
  Component: any;
  pageProps: any;
}) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to /login if not authenticated and not already on the login page
    if (!loading && !isAuthenticated && router.pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Prevent rendering while checking auth status
  if (loading) {
    return <Loading />;
  }

  return <Component {...pageProps} />;
};

export default MyApp;
