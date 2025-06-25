"use client";
import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "@/app/_store/store";

interface UserProviderProps {
  children: ReactNode;
}

function UserProvider({ children }: UserProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}

export default UserProvider;