interface FilterTabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  )
}
