"use client";

import { useContext } from "react";

import { CartUiContext } from "./CartUiProvider";

export function useCartUi() {
  const context = useContext(CartUiContext);

  if (!context) {
    throw new Error("useCartUi must be used within CartUiProvider");
  }

  return context;
}
