"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn, type SignInParams, type SignInResult } from "../api";

export function useSignIn() {
  return useMutation<SignInResult, Error, SignInParams>({
    mutationFn: signIn,
  });
}
