"use client";

import * as React from "react";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ToastViewport({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function Toast({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function ToastAction({ children, ...props }: any) {
  return <button {...props}>{children}</button>;
}

export function ToastTitle({ children, ...props }: any) {
  return <span {...props}>{children}</span>;
}

export function ToastDescription({ children, ...props }: any) {
  return <span {...props}>{children}</span>;
}

export function ToastClose({ children, ...props }: any) {
  return <button {...props}>{children}</button>;
}
