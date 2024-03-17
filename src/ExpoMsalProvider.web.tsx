import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { ReactNode, useEffect, useState } from "react";

// stop redirect error
function getRedirectUri() {
  if (typeof window !== 'undefined') {
    // checking if window is undefined as it is in node
    return `${window.location.protocol}//${window.location.host}`;
  }
  return '';
}

// This is for the microsoft authentication on web.
const pca = new PublicClientApplication({
  auth: {
    clientId: process.env.EXPO_PUBLIC_CLIENTID
      ? process.env.EXPO_PUBLIC_CLIENTID
      : '',
    authority: `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID}/`,
    redirectUri: getRedirectUri(), // to stop node js error
    navigateToLoginRequestUrl: true,
  },
});

export default function ExpoMsalProvider({children}:{children: ReactNode}) {
  const [mounted, setMounted] = useState(false);

  async function initialize() {
    await pca.initialize();
    console.log("Mounted")
    setMounted(true);
  }

  useEffect(() => {
    initialize()
  }, []);

  // This mounted stuff is to prevent errors in expo router.
  if (!mounted) {
    return null;
  }

  return (
    <MsalProvider instance={pca}>
      {children}
    </MsalProvider>
  )
}