export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/licenses/:path*",
    "/recipients/:path*",
    "/groups/:path*",
    "/notifications/:path*",
    "/users/:path*",
    "/settings/:path*"
  ]
};
