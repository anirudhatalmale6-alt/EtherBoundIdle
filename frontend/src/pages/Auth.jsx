import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, User, Lock, ChevronRight } from "lucide-react";

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await base44.auth.login({ id: email, email });
      if (result.user) {
        localStorage.setItem('eb_local_user', JSON.stringify(result.user));
        if (onAuthSuccess) onAuthSuccess(result.user);
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await base44.auth.register({
        id: email,
        email,
        firstName: username,
      });
      if (result.user) {
        localStorage.setItem('eb_local_user', JSON.stringify(result.user));
        if (onAuthSuccess) onAuthSuccess(result.user);
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Ether Bound
            </h1>
          </div>
          <p className="text-muted-foreground">
            {mode === "login" ? "Welcome back, adventurer" : "Begin your journey"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === "login" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("login")}
            >
              Login
            </Button>
            <Button
              variant={mode === "register" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("register")}
            >
              Register
            </Button>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adventurer@etherbound.com"
                required
              />
            </div>

            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" /> Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : (
                <>
                  {mode === "login" ? "Login" : "Create Account"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
