import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import { colors } from "@/constants/theme";

/**
 * Web root HTML (Expo Router). Ensures the document shell uses the app background
 * so you never see a plain white page behind the RN tree during load.
 */
export default function Root({ children }: PropsWithChildren) {
  const bg = colors.background;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                background-color: ${bg} !important;
              }
              #root {
                flex: 1;
                min-height: 100%;
              }
            `,
          }}
        />
      </head>
      <body style={{ backgroundColor: bg, margin: 0 }}>{children}</body>
    </html>
  );
}
