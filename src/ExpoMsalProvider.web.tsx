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

export default function ExpoMsalProvider({children, clientId, tenantId}:{children: ReactNode, clientId: string, tenantId?: string}) {
  const [mounted, setMounted] = useState(false);

  // This is for the microsoft authentication on web.
  const pca = new PublicClientApplication({
    auth: {
      clientId: clientId,
      authority: `https://login.microsoftonline.com/${tenantId ? tenantId: "common"}/`,
      redirectUri: getRedirectUri(), // to stop node js error
      navigateToLoginRequestUrl: true,
    },
  });

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