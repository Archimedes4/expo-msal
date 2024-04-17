import { IPublicClientApplication, PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { ReactNode, useEffect, useRef } from "react";

// stop redirect error
function getRedirectUri() {
  if (typeof window !== 'undefined') {
    // checking if window is undefined as it is in node
    return `${window.location.protocol}//${window.location.host}`;
  }
  return '';
}


export default function ExpoMsalProvider({children, clientId, tenantId}:{children: ReactNode, clientId: string, tenantId?: string}) {
  const pca = useRef<IPublicClientApplication | undefined>(undefined)

  async function initialize() {
    // This is for the microsoft authentication on web.
    const newPca = new PublicClientApplication({
      auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId ? tenantId :"common"}/`,
        redirectUri: getRedirectUri(), // to stop node js error
        navigateToLoginRequestUrl: true
      },
    });
    pca.current = newPca
    await pca.current.initialize();
  }

  useEffect(() => {
    initialize()
  }, []);

  // This mounted stuff is to prevent errors in expo router.
  if (pca.current === undefined) {
    return null;
  }

  return (
    <MsalProvider instance={pca.current}>
      {children}
    </MsalProvider>
  )
}