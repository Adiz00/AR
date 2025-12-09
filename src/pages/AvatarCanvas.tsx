
import {
  AssetUnlockedEvent,
  AvatarCreator,
  AvatarCreatorConfig,
  AvatarCreatorEvent,
  AvatarCreatorRaw,
  AvatarExportedEvent,
  UserAuthorizedEvent,
  UserSetEvent,
} from "@readyplayerme/react-avatar-creator";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const config = {
  // clearCache: true,
  // bodyType: "fullbody",
  // quickStart: false,
  // language: "en",
};

const style = { width: "100%", height: "100vh", border: "none", margin: 0 };

function AvatarCanvas() {

  const [avatarDetails, setAvatarDetails] = useState<any>(null);
  const [token, setToken] = useState<any>(null);

  
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== "https://ar-2lgj3b.readyplayer.me") return;

    console.log("RAW EVENT:", event.data);

    if (event.data?.eventName === "rpm:assetChanged") {
      console.log("ASSET CHANGED:", event.data.data);
    }
  };

  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, []);


  const navigate = useNavigate()

  const fetchAvatarDetails = async (avatarId: string) => {
     try {
    const response = await fetch(`http://localhost:5000/api/avatar/${avatarId}`);
    const data = await response.json();
    console.log("Avatar details:", data);
    setAvatarDetails(data);
  } catch (error) {
    console.error("Error fetching avatar details:", error);
  }
  };

  const handleOnAvatarExported = async (event: AvatarExportedEvent) => {
    console.log(`Avatar URL is:`, event );
    const avatarUrl = event.data.url;
    const avatarId = avatarUrl.split("/").pop()?.split(".")[0];
    // if (avatarId) fetchAvatarDetails(avatarId);

    // const token = await getReadyPlayerToken('6911c2294a1ba3a647c2ec31');
    // console.log('🪙 Ready Player Token:', token);
    // const avatarDetails = await getAvatarDetails(avatarId, token);
    // console.log('🧑‍🎨 Avatar Details:', avatarDetails);
    setTimeout(() => {
    navigate('/dashboard', { state: { avatarId } });
    }, 5000);
  };

  const handleOnUserSet = (event: UserSetEvent) => {
    console.log(`User ID is: ${event.data.id}`);
  };

  // const handleOnAvatarExported = (event: AvatarExportedEvent) => {
  //   console.log(`Avatar URL is: ${event.data.url}`);
  // };

  const handleUserAuthorized = (event: UserAuthorizedEvent) => {
    console.log(`User is:`, event.data);
    // setToken(event.data.token);
  };

  const handleAssetUnlocked = (event: AssetUnlockedEvent) => {
    console.log(`Asset unlocked is: ${event.data.assetId}`);
  };

  // const handleEvent = async (event: AvatarCreatorEvent) => {
  //   console.log('🛰️ Received event:', event);

  //   // You can now detect which event it is
  //   switch (event.name) {
  //     case 'v1.avatar.exported':
  //       console.log('✅ Avatar Exported URL:', event.data);
  //       const token = await getReadyPlayerToken('6911c2294a1ba3a647c2ec31');
  //       console.log('🪙 Ready Player Token:', token);
  //       const avatarDetails = await getAvatarDetails(event.data.id, token);
  //       console.log('🧑‍🎨 Avatar Details:', avatarDetails);

  //       navigate('/dashboard');
  //       break;
  //     case 'userAuthorized':
  //       console.log('🔐 User Authorized:', event.data);
  //       break;
  //     default:
  //       console.log('ℹ️ Other Event:', event.name);
  //       break;
  //   }
  // };

  // getReadyPlayerToken.js
// const getReadyPlayerToken = async (userId: any) => {
//   const PARTNER = "ar-2lgj3b";

//   const url = `https://api.readyplayer.me/v1/auth/token?userId=${userId}&partner=${PARTNER}`;

//   const response = await fetch(url, {
//     method: "GET",
//     headers: {
//       "x-api-key": API_KEY,
//     },
//   });

//   const data = await response.json();
//   if (!response.ok) throw new Error(data?.message || "Failed to get token");

//   return data.data.token; // short-lived token
// };


// getAvatarDetails.js
 const getAvatarDetails = async (avatarId: any, token: any) => {
  const API_KEY = import.meta.env.VITE_READY_PLAYER_ME_API_KEY;

  const response = await fetch(`https://api.readyplayer.me/v2/avatars/${avatarId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // "x-api-key": API_KEY,
      "Content-Type": "application/json",
      "Origin": "https://ar-2lgj3b.readyplayer.me",
      "Referer": "https://ar-2lgj3b.readyplayer.me/",
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Failed to fetch avatar");

  return data; // includes "assets" object
};


  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "100vw", height: "100vh" }}>
        <AvatarCreator
          subdomain="ar-2lgj3b"
          config={config}
          style={style}
          onAvatarExported={handleOnAvatarExported}
          onUserAuthorized={handleUserAuthorized}
          onAssetUnlock={handleAssetUnlocked}
          onUserSet={handleOnUserSet}
          // onEventReceived={handleEvent}
        />
      </div>
      {/* <div style={{ width: "30vw", padding: "1rem", overflowY: "auto" }}>
        <h2>Selected Assets</h2>
        {avatarDetails ? (
          <ul>
            {avatarDetails.assets?.map((asset: any) => (
              <li key={asset.id}>
                <strong>{asset.name}</strong> ({asset.id})<br />
                Category: {asset.category}
                <br />
                URL: {asset.url}
              </li>
            ))}
          </ul>
        ) : (
          <p>No assets selected yet.</p>
        )}
      </div> */}
    </div>
  );
}

export default AvatarCanvas;
