import DashboardClient from "./dashboard-client"

export default function Page() {
  return (
    <div className="p-6 flex flex-col gap-6 bg-gray-50/50 min-h-screen">
      <Header />
      <DashboardClient />
    </div>
  )
}

const Header = () => (
  <div className="w-full flex items-center justify-between">
    <div className="flex items-center gap-3">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
    </div>
    <p className="text-sm flex gap-2 items-center px-4 py-2 bg-green-50 text-green-600 rounded-md">
      <div className="h-2 w-2 bg-green-600 rounded-full" />
      All systems normal
    </p>
  </div>
)
