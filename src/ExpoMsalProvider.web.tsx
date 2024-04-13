import { IPublicClientApplication, PublicClientApplication } from "@azure/msal-browser";
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
  const [pca, setPca] = useState<IPublicClientApplication | undefined>(undefined)

  async function initialize() {
    // This is for the microsoft authentication on web.
    const pca = new PublicClientApplication({
      auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId ? tenantId :"common"}/`,
        redirectUri: getRedirectUri(), // to stop node js error
        navigateToLoginRequestUrl: true
      },
    });
    setPca(pca)
    await pca.initialize();
  }

  useEffect(() => {
    initialize()
  }, []);

  // This mounted stuff is to prevent errors in expo router.
  if (pca === undefined) {
    return null;
  }

  return (
    <MsalProvider instance={pca}>
      {children}
    </MsalProvider>
  )
}