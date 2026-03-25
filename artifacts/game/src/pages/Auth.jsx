import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, User, Lock, ChevronRight } from "lucide-react";

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Use Base44's built-in login redirect
      await base44.auth.redirectToLogin();
    } catch (err) {
      setError("Login redirect failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // First, try to register/invite the user via backend
      const response = await base44.functions.invoke("registerUser", { email, username, password });
      if (response.data.success) {
        setError("Account created! Redirecting to login...");
        setTimeout(() => {
          base44.auth.redirectToLogin();
        }, 1500);
      } else {
        setError(response.data.error || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  const isLoading = false;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-primary tracking-wider mb-2">
            EtherBound Idle
          </h1>
          <p className="text-muted-foreground text-sm mb-6">Welcome back, Adventurer</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 glow-cyan">
          {error && (
            <div className="mb-4 p-3 bg-destructive/20 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-muted/50"
                required
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Nickname
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your hero name"
                  className="bg-muted/50"
                  maxLength={20}
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-muted/50"
                required
              />
              {mode === "register" && (
                <p className="text-xs text-muted-foreground mt-1">Min. 6 characters</p>
              )}
            </div>

            <Button size="lg" className="w-full h-12 font-orbitron text-base tracking-wider" disabled={isLoading}>
              {isLoading ? "Loading..." : mode === "login" ? "Login" : "Register"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {mode === "login" ? "No account yet?" : "Already have an account?"}
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-primary hover:text-primary/80"
            >
              {mode === "login" ? "Create one" : "Login"}
            </Button>
          </div>
        </div>

        <p className="text-center text-white text-xs mt-8">
          All rights reserved and copyright by Tammapac
        </p>
      </motion.div>
    </div>
  );
}