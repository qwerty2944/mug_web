"use client";

import { useMutation } from "@tanstack/react-query";
import { signUp, type SignUpParams } from "../api";

export function useSignUp() {
  return useMutation<void, Error, SignUpParams>({
    mutationFn: signUp,
  });
}
