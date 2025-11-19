/**
 * Login Page
 * User authentication page
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/authStore";
import { setAccessToken, setRefreshToken } from "../../utils/storage";
import { login } from "../../api/endpoints/auth";
import { Input, Button, Card } from "../../components/common";
import { isValidEmail } from "../../utils/helpers";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => login(data),
    onSuccess: (response) => {
      // Map AuthResponse user fields to User type
      const userData = {
        id: response.user.userId,
        username: response.user.name,
        email: response.user.email,
        role: response.user.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTokens(response.accessToken, response.refreshToken);
      // Persist tokens to localStorage so axios and socket auth read them
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

    // Validation
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md" title="Login">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="your@email.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={loginMutation.isPending}
          >
            Login
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register here
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
};
