"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { PropsWithChildren } from "react";

export default function ThemeRegistry({ children }: PropsWithChildren) {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
