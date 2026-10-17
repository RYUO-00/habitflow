// Simple public Privacy Policy and Terms pages (needed by Google for publishing).
const box = { maxWidth: 700, margin: "40px auto", padding: "0 16px", lineHeight: 1.6 };

export function Privacy() {
  return (
    <div style={box}>
      <h1>Privacy Policy</h1>
      <p>HabitFlow is a personal habit and finance tracker.</p>
      <h3>What we collect</h3>
      <p>When you sign in with Google, we receive your name, email address and profile picture. We also store the habits and transactions you enter.</p>
      <h3>How we use it</h3>
      <p>Your information is used only to run the app and show you your own data. We do not sell, share or use it for advertising.</p>
      <h3>Where it is stored</h3>
      <p>Data is stored in a MongoDB Atlas database. Only you can see your own data.</p>
      <h3>Deleting your data</h3>
      <p>To have your account and data deleted, email YOUR_EMAIL_HERE.</p>
      <p><a href="/">Back to HabitFlow</a></p>
    </div>
  );
}

export function Terms() {
  return (
    <div style={box}>
      <h1>Terms of Service</h1>
      <p>HabitFlow is provided free of charge, as is, with no guarantees of availability or accuracy.</p>
      <p>You are responsible for the information you enter. Do not use the app for anything unlawful.</p>
      <p>We may change or stop the service at any time.</p>
      <p>Contact: kiranbantwal41@gmail.com</p>
      <p><a href="/">Back to HabitFlow</a></p>
    </div>
  );
}