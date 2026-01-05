"use client";

import { useMutation } from "@tanstack/react-query";
import { updateLocation } from "../api";

interface UpdateLocationParams {
  userId: string;
  characterName: string;
  mapId: string;
}

export function useUpdateLocation() {
  return useMutation<void, Error, UpdateLocationParams>({
    mutationFn: updateLocation,
  });
}
