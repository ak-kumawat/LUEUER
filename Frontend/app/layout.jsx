// import { ClerkProvider, SignedIn, SignedOut, SignIn, SignUp, UserButton } from "@clerk/nextjs";

// export default function RootLayout({ children }) {
//   return (
//     <ClerkProvider>
//       <html lang="en" className="dark">
//         <body className="bg-bg text-text min-h-screen">
//           {/* Show Sign‑In/Sign‑Up when no user is logged in */}
//           <SignedOut>
//             {/* You can choose to show only SignIn or a full SignUp flow */}
//             <div className="flex flex-col items-center justify-center min-h-screen">
//               <SignIn />
//               <div className="mt-4">
//                 <span className="text-sm text-gray-400">Don’t have an account?</span>
//                 <SignUp mode="modal" />
//               </div>
//             </div>
//           </SignedOut>

//           {/* When a user is logged in, show a button and the app */}
//           <SignedIn>
//             <header className="p-4 flex justify-between items-center border-b border-gray-800">
//               <h1 className="text-2xl font-bold text-white">LUEUER</h1>
//               <UserButton afterSignOutUrl="/" />
//             </header>

//             {/* Main app content */}
//             <main className="p-4">{children}</main>
//           </SignedIn>
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }

import { ClerkProvider } from "@clerk/nextjs";
import AuthWrapper from "./components/AuthWrapper";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="bg-bg text-text min-h-screen">
          <AuthWrapper>{children}</AuthWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}