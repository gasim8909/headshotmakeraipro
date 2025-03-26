import { CheckCircle2, Sparkles, CreditCard, ZapIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-gradient shadow-xl">
          <div className="absolute inset-0 bg-gradient-radial opacity-5"></div>
          <CardHeader className="text-center relative">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Subscription Activated!</CardTitle>
            <CardDescription className="text-base">
              Your premium subscription has been successfully processed. You now have access to all premium features!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold">Premium Benefits Unlocked</h3>
              </div>
              <ul className="space-y-2 text-sm pl-7 list-disc text-gray-600 dark:text-gray-300">
                <li>30 premium quality headshots per month</li>
                <li>All professional styles unlocked</li>
                <li>High-resolution downloads</li>
                <li>Priority processing</li>
                <li>Advanced editing tools</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">Subscription Details</h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Plan:</span>
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">Premium</Badge>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Billing:</span>
                  <span>Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Next invoice:</span>
                  <span>In 30 days</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 relative">
            <Button asChild className="w-full" variant="gradient">
              <Link href="/create/subscribed">
                <ZapIcon className="mr-2 h-4 w-4" />
                Create Your First Premium Headshot
              </Link>
            </Button>
            <div className="flex gap-4 w-full">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard/account">Manage Subscription</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
