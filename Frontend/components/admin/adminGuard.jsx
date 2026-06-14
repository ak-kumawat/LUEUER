import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  // If the user is not signed in, redirect to the sign‑in page
  if (!isSignedIn) {
    if (typeof window !== "undefined") router.replace("/"); // fallback to layout sign‑in
    return null;
  }

  // Clerk stores custom metadata on the user object.
  // You can set `publicMetadata.role = "admin"` from the Clerk dashboard.
  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        <p>🚫 You do not have permission to view this page.</p>
      </div>
    );
  }

  // Admin is authorized → render the protected content
  return <>{children}</>;
}