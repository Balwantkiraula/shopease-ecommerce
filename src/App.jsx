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
      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[url('/loginBackground.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
        <div className="relative w-full max-w-md backdrop-blur-md bg-slate-900/65 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg font-bold">
              ⚠️
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Configure Firebase</span>
          </div>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Add a <code className="bg-slate-950/60 px-1.5 py-0.5 rounded font-mono text-xs text-amber-300">.env</code> file with your Firebase configuration keys and restart the development server.
          </p>
          <div className="text-xs text-slate-400 italic">
            Need help? Refer to the project README for environment setup details.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[url('/loginBackground.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
      {/* Premium dark backdrop overlay with light blur */}
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />

      {/* Glassmorphic Auth Card */}
      <div className="relative w-full max-w-md backdrop-blur-md bg-slate-900/65 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col transition-all duration-300 animate-fade-in">

        {/* Header containing Logo & Guest Mode button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img src="/ShopeaseLogo.png" alt="ShopEase" className="h-24 w-24 object-contain" />
          </div>
          {/* <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-200"
          >
            Continue as guest
          </button> */}
        </div>

        {/* Test account credentials helper */}
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
          <div className="font-semibold mb-2 flex items-center gap-1.5 text-xs text-blue-100 uppercase tracking-wider">
            <span className="text-sm">💡</span> Test Account Credentials
          </div>
          <div className="space-y-1.5 text-sm font-medium">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Email:</span>
              <span className="font-mono text-white underline select-all">bobby@gmail.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Password:</span>
              <span className="font-mono text-white underline select-all">123456</span>
            </div>
          </div>
        </div>

        {/* Dynamic header texts based on Sign In / Sign Up status */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            {isSignUp
              ? "Start shopping in seconds on any device."
              : "Sign in to see your cart and orders."}
          </p>
        </div>

        {/* Login/Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 tracking-wide uppercase mb-1">
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
              className="mt-1 w-full rounded-lg bg-slate-950/40 border border-slate-700/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-300 tracking-wide uppercase mb-1">
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
                className="mt-1 w-full rounded-lg bg-slate-950/40 border border-slate-700/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 transition-all duration-200"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {isSignUp && (
              <p className="text-[11px] text-slate-400 mt-1.5">Use at least 6 characters.</p>
            )}
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirm" className="block text-xs font-semibold text-slate-300 tracking-wide uppercase mb-1">
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
                className="mt-1 w-full rounded-lg bg-slate-950/40 border border-slate-700/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          )}

          {error && (
            <p className="text-red-200 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 flex items-center gap-1.5">
              <span>⚠️</span> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2.5 text-sm font-semibold shadow-lg hover:shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading
              ? isSignUp
                ? "Creating account…"
                : "Signing in…"
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>

          <div className="text-center text-xs text-slate-400 mt-4">
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
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 disabled:opacity-60"
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
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 disabled:opacity-60"
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
