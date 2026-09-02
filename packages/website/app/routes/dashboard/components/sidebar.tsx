import { Home } from "lucide-react";
import { Button } from "~/components/button/button";

interface MenuItem {
  label: string;
  icon: typeof Home;
}

const menuItems: MenuItem[] = [{ label: "Home", icon: Home }];

export function Sidebar() {
  const renderMenu = () => {
    return (
      <nav className="flex flex-col gap-1 mt-8">
        {menuItems.map((menuItem) => (
          <Button
            key={menuItem.label}
            element="button"
            type="button"
            variant="text"
            colorTheme="gray"
            fullWidth
            className="gap-3 px-3"
          >
            <menuItem.icon className="size-4" />
            {menuItem.label}
          </Button>
        ))}
      </nav>
    );
  };

  const renderProfile = () => {
    return (
      <div className="flex items-center gap-3 border-t border-app-gray-200 pt-4">
        <div className="size-6 shrink-0 rounded-sm bg-app-gray-200" />
        <span className="text-sm font-medium text-white">John Doe</span>
      </div>
    );
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col justify-between border-r border-app-gray-200 bg-app-gray-400 p-4">
      {renderMenu()}
      {renderProfile()}
    </aside>
  );
}
