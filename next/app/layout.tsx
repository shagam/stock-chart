"use client";

import BasicTable from "../table/BasicTable";
import { AuthProvider } from "../contexts/AuthContext";
// import { IpProvider } from "../contexts/IpContext";
// import { MobileProvider } from "../contexts/MobileContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <BasicTable/>
              {children}
          {/* </BasicTable> */}
        </AuthProvider>
      </body>
    </html>
  );
}
