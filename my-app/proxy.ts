
import { auth } from "@/auth";
import{
  Default_LOGIN_REDIRECT,
  apiAuthPrefix,
  publicRoutes,
  authRoutes

}from "@/routes"




export default auth((req)=>{
    const {nextUrl} = req;
    const isLoggedIn = !!req.auth;
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    if(isApiAuthRoute){
        return null
    }

    if(isAuthRoute){
        if(isLoggedIn){
            return Response.redirect(new URL(Default_LOGIN_REDIRECT,nextUrl));

        }
        return null;
    }
    if(!isLoggedIn &&!isPublicRoute){
        return Response.redirect(new URL("/auth/sign-in",nextUrl));
    }
    return null;
});

export const config = {
    matcher : ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};