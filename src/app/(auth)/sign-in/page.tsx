'use client';

import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import ClientNavbar from "@/components/client-navbar";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Separate component to handle URL parameters
function MessageHandler({ 
  onMessageSet 
}: { 
  onMessageSet: (message: { message: string; type: "error" | "success" } | null) => void 
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Extract message from search params
    const messageParam = searchParams.get('message');
    const typeParam = searchParams.get('type') as "error" | "success" | null;
    
    if (messageParam && typeParam) {
      onMessageSet({
        message: messageParam,
        type: typeParam
      });
    }
  }, [searchParams, onMessageSet]);
  
  return null; // This component doesn't render anything
}

export default function SignInPage() {
  const [message, setMessage] = useState<{ message: string; type: "error" | "success" } | null>(null);
  
  if (message) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <>
      <ClientNavbar />
      {/* Add Suspense boundary for the MessageHandler */}
      <Suspense fallback={null}>
        <MessageHandler onMessageSet={setMessage} />
      </Suspense>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  className="text-primary font-medium hover:underline transition-all"
                  href="/sign-up"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Email/Password login form */}
            <form className="flex flex-col space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-all"
                      href="/forgot-password"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Your password"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <SubmitButton
                className="w-full"
                pendingText="Signing in..."
                formAction={signInAction}
              >
                Sign in
              </SubmitButton>

              {message && <FormMessage message={message} />}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
