import { SubscriptionCheck } from "@/components/subscription-check";
import SubscribedCreateContent from "./subscribed-content";

export default async function SubscribedCreatePage() {
  return (
    <SubscriptionCheck redirectTo="/pricing">
      <SubscribedCreateContent />
    </SubscriptionCheck>
  );
}
