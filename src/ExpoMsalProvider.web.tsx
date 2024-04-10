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
    clientId: '08624b03-1aa6-40c4-8fb3-149c39026dff',
    authority: `https://login.microsoftonline.com/${'551df04d-543a-4d61-955e-e4294c4cf950'}/`,
    redirectUri: getRedirectUri(), // to stop node js error
  },
});

export default function ExpoMsalProvider({children, clientId, tenantId}:{children: ReactNode, clientId: string, tenantId?: string}) {
  const [mounted, setMounted] = useState(false);

  async function initialize() {
    await pca.initialize();
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