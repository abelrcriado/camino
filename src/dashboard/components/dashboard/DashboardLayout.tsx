import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Home,
  CreditCard,
  MapPin,
  Building2,
  Wrench,
  Coffee,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  TrendingUp,
  FolderTree,
  Warehouse,
  Package,
  Truck,
  Network,
  ChevronDown,
  ChevronRight,
  Route,
  Grid3x3,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/dashboard/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/dashboard/components/ui/dropdown-menu";
import { Button } from "@/dashboard/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Principal", // Dashboard siempre abierto por defecto
  ]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );
  };

  const navigationSections = [
    {
      title: "Principal",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Reservas", href: "/dashboard/bookings", icon: Calendar },
        { name: "Pagos", href: "/dashboard/payments", icon: CreditCard },
        {
          name: "Revenue Analytics",
          href: "/dashboard/revenue-analytics",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "Gestión de Red",
      items: [
        { name: "Caminos", href: "/dashboard/caminos", icon: Route },
        { name: "Ubicaciones", href: "/dashboard/locations", icon: MapPin },
        {
          name: "Puntos de Servicio",
          href: "/dashboard/service-points",
          icon: Building2,
        },
        { name: "Talleres", href: "/dashboard/workshops", icon: Wrench },
        {
          name: "Máquinas Vending",
          href: "/dashboard/vending-machines",
          icon: Coffee,
        },
      ],
    },
    {
      title: "Catálogo",
      items: [
        { name: "Categorías", href: "/dashboard/categories", icon: FileText },
        {
          name: "Subcategorías",
          href: "/dashboard/subcategories",
          icon: FolderTree,
        },
        { name: "Productos", href: "/dashboard/products", icon: Coffee },
        { name: "Servicios", href: "/dashboard/services", icon: Settings },
      ],
    },
    {
      title: "Inventario",
      items: [
        {
          name: "Configuración de Red",
          href: "/dashboard/network-config",
          icon: Network,
        },
        {
          name: "Puntos de Stock",
          href: "/dashboard/warehouses",
          icon: Warehouse,
        },
        {
          name: "Stock Multinivel",
          href: "/dashboard/warehouse-inventory",
          icon: Package,
        },
        {
          name: "Slots de Vending",
          href: "/dashboard/vending-machine-slots",
          icon: Grid3x3,
        },
        {
          name: "Pedidos de Stock",
          href: "/dashboard/stock-requests",
          icon: Truck,
        },
      ],
    },
    {
      title: "Administración",
      items: [
        { name: "Usuarios", href: "/dashboard/users", icon: Users },
        { name: "Reportes", href: "/dashboard/reports", icon: FileText },
        { name: "Configuración", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-1 border-r bg-card">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">
                  C
                </span>
              </div>
              <span className="text-xl font-bold">Camino</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigationSections.map((section) => {
              const isExpanded = expandedSections.includes(section.title);
              const hasActiveItem = section.items.some((item) =>
                isActive(item.href)
              );

              return (
                <div key={section.title} className="space-y-1">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors",
                      hasActiveItem
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <span>{section.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="space-y-1 pl-2">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              isActive(item.href)
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">Admin User</span>
                    <span className="text-xs text-muted-foreground">
                      admin@camino.com
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6">
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {navigationSections
                  .flatMap((section) => section.items)
                  .find((item) => isActive(item.href))?.name || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
