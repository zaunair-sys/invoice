"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { appShellStyles } from "@/assets/dummyStyles";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { useGsapAnimations, shouldDisableAnimations } from "@/lib/animations";

function DashboardIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function InvoiceIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function CreateIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function ProfileIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function CollapseIcon({ className = "w-4 h-4", collapsed }) {
  return (
    <svg
      className={`${className} transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  );
}

function SidebarLink({ to, icon, children, collapsed, active, onNavigate }) {
  return (
    <Link
      href={to}
      className={`${appShellStyles.sidebarLink} ${collapsed ? appShellStyles.sidebarLinkCollapsed : ""} ${active ? appShellStyles.sidebarLinkActive : appShellStyles.sidebarLinkInactive}`}
      onClick={onNavigate}
      data-hover="lift"
    >
      <div
        className={`${appShellStyles.sidebarIcon} ${active ? appShellStyles.sidebarIconActive : appShellStyles.sidebarIconInactive}`}
      >
        {icon}
      </div>
      {!collapsed && <span className={appShellStyles.sidebarText}>{children}</span>}
      {!collapsed && active && <div className={appShellStyles.sidebarActiveIndicator} />}
    </Link>
  );
}

const AppShell = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem("sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scopeRef = useRef(null);
  const pathnameKey = usePathname();
  const disableAnimations = shouldDisableAnimations(pathnameKey);

  useGsapAnimations(scopeRef, pathnameKey);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sidebar_collapsed", collapsed ? "true" : "false");
    } catch { }
  }, [collapsed]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // logout
  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn('Signout error:', error);
    }
    router.push('/');
  };

  // toggle sidebar
  const toggleSidebar = () => setCollapsed(!collapsed);

  //  display name helper
  const displayName = (() => {
    if (!user) return "User";
    const name = user.name || "";
    return name.trim() || (user.email || "").split?.("@")?.[0] || "User";
  })();

  const firstName = () => {
    const parts = displayName.split(" ").filter(Boolean);
    return parts.length ? parts[0] : displayName;
  };

  const initials = () => {
    const parts = displayName.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const isLinkActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div
      ref={scopeRef}
      className={appShellStyles.root}
      data-collapsed={collapsed}
      data-open={mobileOpen}
      data-no-animate={disableAnimations ? "" : undefined}
    >
      <div className={appShellStyles.layout}>
        <aside
          className={`${appShellStyles.sidebar} ${collapsed ? appShellStyles.sidebarCollapsed : appShellStyles.sidebarExpanded}`}
          data-collapsed={collapsed}
          data-open={mobileOpen}
          data-animate="fade-up"
        >
          <div className={appShellStyles.sidebarGradient}></div>

          <div className={appShellStyles.sidebarContainer}>
            <div>
              <div className={`${appShellStyles.logoContainer} ${collapsed ? appShellStyles.logoContainerCollapsed : ""}`}>
                <Link href="/app/dashboard" className={appShellStyles.logoLink} data-hover="lift">
                  <div className="relative">
                    <img src="/logo.png" alt="logo" className={appShellStyles.logoImage} />
                    <div className="absolute inset-0 rounded-lg blur-sm group-hover:blur-md transition-all duration-300" />
                  </div>

                  {!collapsed && (
                    <div className={appShellStyles.logoTextContainer}>
                      <span className={appShellStyles.logoText}>PromptToInvoice</span>
                      <div className={appShellStyles.logoUnderline}></div>
                    </div>
                  )}
                </Link>

                {!collapsed && (
                  <button onClick={toggleSidebar} className={appShellStyles.collapseButton} data-hover="magnetic">
                    <CollapseIcon collapsed={collapsed} />
                  </button>
                )}
              </div>

              <nav className={appShellStyles.nav} data-stagger>
                <SidebarLink to="/app/dashboard" icon={<DashboardIcon />} collapsed={collapsed} active={isLinkActive("/app/dashboard")} onNavigate={() => setMobileOpen(false)}>
                  Dashboard
                </SidebarLink>
                <SidebarLink to="/app/invoices" icon={<InvoiceIcon />} collapsed={collapsed} active={isLinkActive("/app/invoices")} onNavigate={() => setMobileOpen(false)}>
                  Invoices
                </SidebarLink>
                <SidebarLink to="/app/select-template" icon={<CreateIcon />} collapsed={collapsed} active={isLinkActive("/app/select-template") || isLinkActive("/app/create-invoice")} onNavigate={() => setMobileOpen(false)}>
                  Create Invoice
                </SidebarLink>
                <SidebarLink to="/app/business" icon={<ProfileIcon />} collapsed={collapsed} active={isLinkActive("/app/business")} onNavigate={() => setMobileOpen(false)}>
                  Business Profile
                </SidebarLink>
              </nav>
            </div>
            <div className={appShellStyles.userSection}>
              <div className={`${appShellStyles.userDivider} ${collapsed ? appShellStyles.userDividerCollapsed : appShellStyles.userDividerExpanded}`}>
                {!collapsed ? (
                  <button onClick={logout} className={appShellStyles.logoutButton} data-hover="lift">
                    <LogoutIcon className={appShellStyles.logoutIcon} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center p-3 rounded-xl text-red-600 hover:bg-red-50 hover:shadow-md transition-all duration-300"
                    data-hover="lift"
                  >
                    <LogoutIcon className="w-5 h-5 hover:scale-110 transition-transform" />
                  </button>
                )}

                <div className={appShellStyles.collapseSection}>
                  <button
                    onClick={toggleSidebar}
                    className={`${appShellStyles.collapseButtonInner} ${collapsed ? appShellStyles.collapseButtonCollapsed : ""}`}
                    data-hover="lift"
                  >
                    {!collapsed && <span>{collapsed ? "Expand" : "Collapse"}</span>}
                    <CollapseIcon collapsed={collapsed} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
        {mobileOpen && (
          <div className={appShellStyles.mobileOverlay} data-open={mobileOpen}>
            <div className={appShellStyles.mobileBackdrop} onClick={() => setMobileOpen(false)} />
            <div className={appShellStyles.mobileSidebar} data-animate="fade-up">
              <div className={appShellStyles.mobileHeader}>
                <Link href="/app/dashboard" className={appShellStyles.mobileLogoLink} onClick={() => setMobileOpen(false)}>
                  <img src="/logo.png" alt="logo" className={appShellStyles.mobileLogoImage} />
                  <span className={appShellStyles.mobileLogoText}>PromptToInvoice</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className={appShellStyles.mobileCloseButton}>
                  <svg className={appShellStyles.mobileCloseIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className={appShellStyles.mobileNav} data-stagger>
                <Link
                  onClick={() => setMobileOpen(false)}
                  href="/app/dashboard"
                  className={`${appShellStyles.mobileNavLink} ${isLinkActive("/app/dashboard") ? appShellStyles.mobileNavLinkActive : appShellStyles.mobileNavLinkInactive}`}
                  data-hover="lift"
                >
                  <DashboardIcon /> Dashboard
                </Link>
                <Link
                  onClick={() => setMobileOpen(false)}
                  href="/app/invoices"
                  className={`${appShellStyles.mobileNavLink} ${isLinkActive("/app/invoices") ? appShellStyles.mobileNavLinkActive : appShellStyles.mobileNavLinkInactive}`}
                  data-hover="lift"
                >
                  <InvoiceIcon /> Invoices
                </Link>
                <Link
                  onClick={() => setMobileOpen(false)}
                  href="/app/select-template"
                  className={`${appShellStyles.mobileNavLink} ${isLinkActive("/app/select-template") || isLinkActive("/app/create-invoice") ? appShellStyles.mobileNavLinkActive : appShellStyles.mobileNavLinkInactive}`}
                  data-hover="lift"
                >
                  <CreateIcon /> Create Invoice
                </Link>
                <Link
                  onClick={() => setMobileOpen(false)}
                  href="/app/business"
                  className={`${appShellStyles.mobileNavLink} ${isLinkActive("/app/business") ? appShellStyles.mobileNavLinkActive : appShellStyles.mobileNavLinkInactive}`}
                  data-hover="lift"
                >
                  <ProfileIcon /> Business Profile
                </Link>
              </nav>
              <div className={appShellStyles.mobileLogoutSection}>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className={appShellStyles.mobileLogoutButton}
                  data-hover="lift"
                >
                  <LogoutIcon /> Logout
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="pti-app-main flex-1 min-w-0" data-collapsed={collapsed} style={{ position: "relative", zIndex: "20" }}>
          <header className={`${appShellStyles.header} ${scrolled ? appShellStyles.headerScrolled : appShellStyles.headerNotScrolled}`} data-animate="fade-up">
            <div className={appShellStyles.headerTopSection}>
              <div className={appShellStyles.headerContent}>
                <button onClick={() => setMobileOpen(true)} className={appShellStyles.mobileMenuButton} data-hover="lift">
                  <svg className={appShellStyles.mobileMenuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {!isMobile && (
                  <button onClick={toggleSidebar} className={appShellStyles.desktopCollapseButton} data-hover="magnetic">
                    <CollapseIcon collapsed={collapsed} />
                  </button>
                )}
                <div className={appShellStyles.welcomeContainer}>
                  <h2 className={appShellStyles.welcomeTitle}>
                    Welcome back, <span className={appShellStyles.welcomeName}>{firstName()}</span>
                  </h2>
                  <p className={appShellStyles.welcomeSubtitle}>Ready to create invoice</p>
                </div>
              </div>
            </div>

            <div className={appShellStyles.headerActions}>
              <ThemeToggle />
              <button onClick={() => router.push("/app/select-template")} className={appShellStyles.ctaButton} data-hover="magnetic">
                <CreateIcon className={appShellStyles.ctaIcon} />
                <span className="hidden xs:inline">Create Invoice</span>
                <span className="xs:hidden">Create</span>
              </button>

              <div className={appShellStyles.userSectionDesktop}>
                <div className={appShellStyles.userInfo}>
                  <div className={appShellStyles.userName}>{displayName}</div>
                  <div className={appShellStyles.userEmail}>{user?.email}</div>
                </div>

                <div className={appShellStyles.userAvatarContainer}>
                  <div className={appShellStyles.userAvatar} data-hover="lift">
                    {initials()}
                    <div className={appShellStyles.userAvatarBorder} />
                  </div>
                  <div className={appShellStyles.userStatus}></div>
                </div>
              </div>
            </div>
          </header>

          <main className={appShellStyles.main} data-animate="fade-up">
            <div className={appShellStyles.mainContainer}>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
