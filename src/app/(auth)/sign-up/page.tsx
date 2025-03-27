'use client';

import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
import ClientNavbar from "@/components/client-navbar";
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

export default function SignUpPage() {
  const [message, setMessage] = useState<{ message: string; type: "error" | "success" } | null>(null);

  // If we have a message to display, show it
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
              <h1 className="text-3xl font-semibold tracking-tight">Sign up</h1>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  className="text-primary font-medium hover:underline transition-all"
                  href="/sign-in"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Email/Password signup form */}
            <form className="flex flex-col space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full"
                  />
                </div>

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
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Your password"
                    minLength={6}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <SubmitButton
                formAction={signUpAction}
                pendingText="Signing up..."
                className="w-full"
              >
                Sign up
              </SubmitButton>

              {message && <FormMessage message={message} />}
            </form>
          </div>
        </div>
        <SmtpMessage />
      </div>
    </>
  );
}
