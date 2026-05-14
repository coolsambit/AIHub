export default function WelcomeBanner({ title = "Welcome to Foundry Developer Portal", subtitle = "Explore and monitor your Foundry resources in one place.", children }) {
  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-white border border-blue-100 text-blue-900 px-5 py-3 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-3">
      <div className="w-full md:flex-1 text-center min-w-0">
        {title && <h2 className="text-xl font-bold text-blue-900 leading-tight">{title}</h2>}
        {subtitle && <p className="text-sm text-blue-500 leading-tight mt-0.5">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex flex-col md:flex-row gap-2 md:shrink-0 w-full md:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
