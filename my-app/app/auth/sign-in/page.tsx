import Image from "next/image";
import React from "react";
import SignInFormClient from "@/modules/auth/components/sign-in-form-client";

const Page = () => {
  return (
    <>
      <Image
        src="/login.svg"
        alt="Login-Image"
        width={300}
        height={300}
        className="m-6"
        style={{ width: "300px", height: "auto" }}
        priority
      />

      <SignInFormClient />
    </>
  );
};

export default Page;