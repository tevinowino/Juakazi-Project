import { createCookieSessionStorage, type Session } from "react-router";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // a Cookie from `createCookie` or the same CookieOptions to create one
    cookie: {
      name: "__session",
      secrets: ["r3m1xr0ck5"],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      secure: true,
    },
  });

export function setSuccessMessage(session: Session, message: string) {
  session.flash("toastMessage", { message, type: "success" });
}
