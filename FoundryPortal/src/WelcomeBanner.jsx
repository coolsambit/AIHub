export default function WelcomeBanner({ title = "Welcome to Foundry Developer Portal", subtitle = "Explore and monitor your Foundry resources in one place.", children }) {
  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-white border border-blue-100 text-blue-900 px-10 py-6 rounded-xl shadow-sm text-center">
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {subtitle && <p className="text-base mb-1">{subtitle}</p>}
      {children}
    </div>
  );
}
