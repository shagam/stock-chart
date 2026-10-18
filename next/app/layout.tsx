"use client";

import {BasicTable} from "../table/BasicTable";
import { AuthProvider } from "../contexts/AuthContext";
// import { IpProvider } from "../contexts/IpContext";
// import { MobileProvider } from "../contexts/MobileContext";
import {SharedProvider} from '../contexts/SharedContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SharedProvider>
            <BasicTable/>
              {children}
          {/* </BasicTable> */}
          </SharedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
