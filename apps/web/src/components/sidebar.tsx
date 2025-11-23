import { LogOut, LayoutDashboard, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  onLogout: () => void
  userName: string
}

export default function Sidebar({ activeView, onViewChange, onLogout, userName }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "sites", label: "Sites & Projectors", icon: MapPin },
    { id: "fieldworkers", label: "Field Workers", icon: Users },
  ]

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">FieldService</h1>
        <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeView === item.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="px-4 py-3 rounded-lg bg-muted">
          <p className="text-sm font-medium text-foreground">{userName}</p>
          <p className="text-xs text-muted-foreground">Administrator</p>
        </div>
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-border bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
