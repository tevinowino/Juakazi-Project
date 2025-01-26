import {
  data,
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import stylesheet from "./app.css?url";
import { commitSession, getSession } from "./session.server";
import { getUser } from "./supabase.server";
import { 
  Briefcase, 
  Home, 
  Info, 
  LogIn, 
  LogOut, 
  Menu, 
  Phone, 
  User, 
  UserPlus, 
  X, 
  MapPin, 
  PhoneCall, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from "lucide-react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: Route.LoaderArgs) {
  let session = await getSession(request.headers.get("Cookie"));
  let toastMessage = session.get("toastMessage");

  let { user } = await getUser(request);

  let userEmail = user?.email;

  return data(
    { toastMessage, userEmail },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-inter antialiased bg-gray-50 text-gray-900">
        {children}
        <Toaster position="top-right" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  let { toastMessage, userEmail } = loaderData;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;
    let { message, type } = toastMessage;
    switch (type) {
      case "success": {
        toast.success(message);
        break;
      }
      case "error": {
        toast.error(message);
        break;
      }
    }
  }, [toastMessage]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/logo-no-background.png"
              alt="JuaKazi Logo"
              className="w-40 h-auto transform transition hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" icon={Home}>Home</NavLink>
            <NavLink to="/services" icon={Briefcase}>Services</NavLink>
            <NavLink to="/about" icon={Info}>About Us</NavLink>
            <NavLink to="/contact" icon={Phone}>Contact</NavLink>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {userEmail ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 flex items-center gap-2">
                  <User size={18} /> {userEmail}
                </span>
                <Link 
                  to="/dashboard" 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition"
                >
                  Dashboard
                </Link>
                <Form method="post" action="/logout">
                  <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition flex items-center gap-2">
                    <LogOut size={20} /> Logout
                  </button>
                </Form>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 transition flex items-center gap-2"
                >
                  <LogIn size={20} /> Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-2"
                >
                  <UserPlus size={20} /> Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-800 hover:text-blue-600 transition"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden absolute w-full bg-white/95 backdrop-blur-md shadow-lg">
            <nav className="flex flex-col p-4 space-y-4">
              <MobileNavLink to="/" icon={Home}>Home</MobileNavLink>
              <MobileNavLink to="/services" icon={Briefcase}>Services</MobileNavLink>
              <MobileNavLink to="/about" icon={Info}>About Us</MobileNavLink>
              <MobileNavLink to="/contact" icon={Phone}>Contact</MobileNavLink>

              {userEmail ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User size={18} /> {userEmail}
                  </div>
                  <Form method="post" action="/logout">
                    <button className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2">
                      <LogOut size={20} /> Logout
                    </button>
                  </Form>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link
                    to="/login"
                    className="w-full text-center text-blue-600 hover:text-blue-800 transition flex items-center justify-center gap-2"
                  >
                    <LogIn size={20} /> Login
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <UserPlus size={20} /> Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
      
      <Outlet />

      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <img
              src="/logo-no-background.png"
              alt="JuaKazi Logo"
              className="w-40 mb-4 filter brightness-0 invert"
            />
            <p className="text-gray-400">
              Connecting skilled workers with clients efficiently and securely.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Quick Links</h4>
            <nav className="space-y-2">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/services">Services</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </nav>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-blue-400" />
                <span>Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall size={20} className="text-blue-400" />
                <span>+254 700 000 000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-blue-400" />
                <span>support@juakazi.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Follow Us</h4>
            <div className="flex space-x-4">
              <SocialLink href="#facebook"><Facebook /></SocialLink>
              <SocialLink href="#twitter"><Twitter /></SocialLink>
              <SocialLink href="#instagram"><Instagram /></SocialLink>
              <SocialLink href="#linkedin"><Linkedin /></SocialLink>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 mt-8 pt-4 border-t border-gray-800">
          © {new Date().getFullYear()} JuaKazi. All Rights Reserved.
        </div>
      </footer>
    </>
  );
}

function NavLink({ to, children, icon: Icon }) {
  return (
    <Link
      to={to}
      className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2 group"
    >
      <Icon size={20} className="group-hover:text-blue-600" /> {children}
    </Link>
  );
}

function MobileNavLink({ to, children, icon: Icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 py-2 hover:bg-blue-50 px-4 rounded-lg transition group"
    >
      <Icon size={20} className="group-hover:text-blue-600" /> {children}
    </Link>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-gray-400 hover:text-white transition block"
    >
      {children}
    </Link>
  );
}

function SocialLink({ href, children }) {
  return (
    <a 
      href={href} 
      className="text-gray-400 hover:text-white transition transform hover:scale-110 inline-block"
    >
      {children}
    </a>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center p-8 bg-white shadow-2xl rounded-2xl">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">{message}</h1>
        <p className="text-gray-700 mb-6">{details}</p>
        {stack && (
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-left">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}