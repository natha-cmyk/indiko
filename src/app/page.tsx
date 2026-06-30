export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 24px" }}>
      <div
        style={{
          width: 44, height: 44, borderRadius: 12, background: "#FF001E",
          color: "#fff", display: "flex", alignItems: "center",
          justifyContent: "center", fontWeight: 800, fontSize: 18,
        }}
      >
        in
      </div>
      <h1 style={{ marginTop: 16 }}>Indiko</h1>
      <p style={{ color: "#6B6B6B", lineHeight: 1.6 }}>
        Base da aplicação no ar. Backend em construção. Verifique a saúde do
        serviço em <code>/api/health</code>.
      </p>
    </main>
  );
}
