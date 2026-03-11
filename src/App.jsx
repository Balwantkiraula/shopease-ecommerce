import { useState, useEffect } from "react";
import { auth, isFirebaseConfigured } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already signed in, redirect to home
        navigate("/home");
      }
    });
    return () => unsub();
  }, [navigate]);

  const getFriendlyAuthError = (err) => {
    const code = err?.code || "";
    switch (code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/missing-password":
        return "Enter your password.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Incorrect email or password.";
      case "auth/email-already-in-use":
        return "This email is already registered.";
      default:
        return err?.message || "Something went wrong. Try again.";
    }
  };

  const validateInputs = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;

    if (!emailRegex.test(trimmedEmail)) {
      return "Enter a valid email address.";
    }
    if (trimmedPassword.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (isSignUp && trimmedPassword !== confirmPassword.trim()) {
      return "Passwords do not match.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
        if (res?.user) navigate("/home");
      } else {
        const res = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        if (res?.user) navigate("/home");
      }
    } catch (err) {
      console.error(isSignUp ? "Sign up error:" : "Sign in error:", err);
      setError(getFriendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white border rounded-xl p-6 shadow">
          <h1 className="text-xl font-semibold mb-3">Configure Firebase</h1>
          <p className="text-sm text-gray-600 mb-3">
            Add a <code>.env</code> file with your Firebase keys and restart the
            server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
        {/* Left marketing / illustration panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-10 flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-xl font-semibold">
                🛒
              </div>
              <span className="text-2xl font-bold tracking-tight">ShopEase</span>
            </div>
            <h2 className="mt-10 text-3xl font-semibold leading-tight">
              Your favourite products,
              <br />
              in one seamless experience.
            </h2>
            <p className="mt-3 text-sm text-blue-100 max-w-md">
              Discover trending deals, manage your cart, track your orders, and shop securely
              from any device.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 text-xs text-blue-100">
            <div className="space-y-1">
              <p className="font-semibold text-white">Fast checkout</p>
              <p>Save your address and payment details for quicker orders.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white">Secure account</p>
              <p>Protected with modern authentication powered by Firebase.</p>
            </div>
          </div>
        </div>

        {/* Right auth panel */}
        <div className="w-full lg:w-1/2 px-6 sm:px-8 py-6 sm:py-8">
          {/* Logo / Title (mobile & desktop) */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                🛒
              </div>
              <span className="text-lg font-semibold text-gray-900">ShopEase</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-xs text-gray-500 hover:text-blue-600 hover:underline"
            >
              Continue as guest
            </button>
          </div>
          <div className="mb-2 text-sm sm:text-base text-gray-800 text-center sm:text-right font-bold leading-snug">
            <div>To browse the project use:</div>
            <div className="mt-1">Email: <span className="underline">bobby@gmail.com</span></div>
            <div className="mt-1">Password: <span className="underline">123456</span></div>
          </div>
          <p className="mb-5 text-[11px] sm:text-xs text-gray-500 text-center sm:text-right">
            If you don&apos;t want to create an account, you can continue as guest.
          </p>

          <div className="mb-5 text-center sm:text-left">
            <div className="w-10 h-10 sm:w-11 sm:h-11 mx-auto sm:mx-0 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-sm">
              🔒
            </div>
            <h1 className="mt-3 text-xl sm:text-2xl font-semibold text-gray-900">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {isSignUp
                ? "Start shopping in seconds on any device."
                : "Welcome back! Sign in to see your cart and orders."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 px-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {isSignUp && (
                <p className="text-[11px] text-gray-500 mt-1">Use at least 6 characters.</p>
              )}
            </div>
            {isSignUp && (
              <div>
                <label htmlFor="confirm" className="block text-xs font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {error && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-2 py-1">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading
                ? isSignUp
                  ? "Creating account…"
                  : "Signing in…"
                : isSignUp
                ? "Create account"
                : "Sign In"}
            </button>

            <div className="text-center text-xs text-gray-600">
              {isSignUp ? (
                <>
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError("");
                    }}
                    disabled={loading}
                    className="text-blue-600 hover:underline disabled:opacity-60"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  <span>New here? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError("");
                    }}
                    disabled={loading}
                    className="text-blue-600 hover:underline disabled:opacity-60"
                  >
                    Create an account
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
