import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { setAccessToken, setRefreshToken } from "../../utils/storage";
import { login } from "../../api/endpoints/auth";
import { Input, Button } from "../../components/common";
import { isValidEmail } from "../../utils/helpers";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => login(data),
    onSuccess: (response) => {
      const userData = {
        id: response.user.userId,
        username: response.user.name,
        email: response.user.email,
        role: response.user.role,
        displayName: response.user.displayName ?? null,
        avatarUrl: response.user.avatarUrl ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTokens(response.accessToken, response.refreshToken);
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(userData);
      navigate("/dashboard");
    },
    onError: (err: Error) => {
      const error = err as unknown as {
        response?: { data?: { error?: string } };
      };
      setError(error.response?.data?.error || "Login failed");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] flex flex-col items-center bg-surface border border-border shadow-sm p-10">
        {/* Brand monogram */}
        <div className="w-14 h-14 bg-primary rounded-none flex items-center justify-center mb-6">
          <span className="text-white text-2xl font-headline font-light tracking-tight">R</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-headline font-light text-on-surface text-center">
          Welcome back
        </h1>
        <p className="text-secondary text-sm mt-1.5 text-center">
          Sign in to continue to LeaderBoard
        </p>

        {/* Decorative accent */}
        <hr className="w-12 border-primary/20 mt-8 mb-8" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 bg-[#FEF2F2] border border-error/30 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@email.com"
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-body text-on-surface">
              Password
              <span className="text-error ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-surface text-on-surface border border-border rounded-none px-4 py-3 pr-12 text-sm font-body placeholder:text-secondary/50 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            loading={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <hr className="flex-1 border-border" />
            <span className="text-xs text-secondary">or continue with</span>
            <hr className="flex-1 border-border" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-secondary">
            Don't have an account?{" "}
            <a href="/register" className="text-accent hover:text-tertiary transition-colors">
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};
