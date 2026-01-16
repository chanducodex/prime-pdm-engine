import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to the provider change history page by default
  redirect("/change-history")
}
