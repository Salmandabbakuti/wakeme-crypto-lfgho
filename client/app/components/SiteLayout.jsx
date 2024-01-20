"use client";
import { Divider, Layout } from "antd";
import { ConnectKitButton } from "connectkit";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 99,
          padding: 0,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h3>Connectkit Demo</h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 5px"
          }}
        >
          <ConnectKitButton
            label="Connect Wallet" // button label
            showAvatar={true} // show avatar
            showBalance={true} // show balance
            theme="auto" // light, dark, auto
            mode="auto" // light, dark, auto
            // onClick={() => console.log("Connect clicked")} // onClick handler
          />
        </div>
      </Header>
      <Content
        style={{
          margin: "12px 8px",
          padding: 12,
          minHeight: "100%",
          color: "black",
          maxHeight: "100%"
        }}
      >
        {children}
      </Content>
      <Divider plain />
      <Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©{new Date().getFullYear()} Salman Dabbakuti. Powered by Connectkit.
        </a>
        <p style={{ fontSize: "12px" }}>v0.0.1</p>
      </Footer>
    </Layout>
  );
}
