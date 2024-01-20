"use client";
import { useEffect, useState } from "react";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, base, polygonMumbai, goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, base, goerli, polygonMumbai],
  [publicProvider()]
);

const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
  "fe4f9ae5fd32e85930b2c276185731ff";

const wagmiConfig = createConfig(
  getDefaultConfig({
    chains,
    publicClient,
    webSocketPublicClient,
    walletConnectProjectId: projectId,
    autoConnect: true,
    appName: "Web3 Dapp Starter",
    appDescription: "Web3 Dapp Starter",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png" // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider
        theme="auto" // or web95/retro/minimal/rounded
        mode="auto" // or light/dark
        debugMode
        options={{
          language: "en-US",
          disclaimer: "This is a demo app. Use at your own risk.",
          initialChainId: 1,
          enforceSupportedChains: true
        }}
      >
        {mounted && children}
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
