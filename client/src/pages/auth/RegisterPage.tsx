import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  register as registerAPI,
  login as loginAPI,
} from "../../api/endpoints/auth";
import { useAuthStore } from "../../stores/authStore";
import { Loader2 } from "lucide-react";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (data: Omit<RegisterFormData, "confirmPassword">) =>
      registerAPI(data),
    onSuccess: async (_response, variables) => {
      // After successful registration, automatically log in
      try {
        const loginResult = await loginAPI({
          email: variables.email,
          password: variables.password,
        });
        // Map AuthResponse user fields to User type
        const userData = {
          id: loginResult.user.userId,
          username: loginResult.user.name,
          email: loginResult.user.email,
          role: loginResult.user.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setTokens(loginResult.accessToken, loginResult.refreshToken);
        setUser(userData);
        navigate("/dashboard");
      } catch {
        // Registration succeeded but login failed - redirect to login page
        navigate("/login");
      }
    },
    onError: (err: Error) => {
      const error = err as unknown as {
        response?: { data?: { error?: string } };
      };
      setError(error.response?.data?.error || "Registration failed");
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setError("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="bg-surface rounded-md border border-border shadow p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-6">Create Account</h2>

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-[#3A1A1A] border border-error/30 text-error px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Username
          </label>
          <input
            type="text"
            placeholder="your username"
            className="w-full bg-surface text-on-surface placeholder:text-secondary/50 px-3 py-2 border border-border rounded-none focus:outline-none focus:border-primary"
            {...register("username")}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-error">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="you@email.com"
            className="w-full bg-surface text-on-surface placeholder:text-secondary/50 px-3 py-2 border border-border rounded-none focus:outline-none focus:border-primary"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full bg-surface text-on-surface placeholder:text-secondary/50 px-3 py-2 border border-border rounded-none focus:outline-none focus:border-primary"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Confirm your password"
            className="w-full bg-surface text-on-surface placeholder:text-secondary/50 px-3 py-2 border border-border rounded-none focus:outline-none focus:border-primary"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-accent text-white py-2 px-4 rounded-none hover:bg-[#7A16E0] dark:hover:bg-[#6B14CC] disabled:bg-gray-400 flex items-center justify-center"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {registerMutation.isPending ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-center text-sm text-secondary mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-accent hover:text-accent font-medium"
        >
          Login here
        </Link>
      </p>
    </div>
  );
};
