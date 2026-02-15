import * as React from 'react';
import {
  Home,
  Sparkles,
  BriefcaseBusiness,
  Users,
  BookOpen,
  Rocket,
  HeartHandshake,
  Heart,
  Shield,
  Hospital,
  Building2,
  Building,
  Newspaper,
  UserRound,
  School,
  Compass,
} from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type NavLeaf = {
  label: string;
  href: string;
  description?: string;
  icon?: string;
};

type NavSection = {
  label: string;
  items: NavLeaf[];
};

type NavMenu = {
  label: string;
  href?: string;
  icon?: string;
  sections?: NavSection[];
};

interface SiteNavigationProps {
  items: NavMenu[];
  contactHref: string;
  className?: string;
}

const iconMap = {
  home: Home,
  sparkles: Sparkles,
  briefcase: BriefcaseBusiness,
  users: Users,
  about: BookOpen,
  rocket: Rocket,
  community: HeartHandshake,
  heart: Heart,
  shield: Shield,
  hospital: Hospital,
  bank: Building2,
  church: Building,
  news: Newspaper,
  user: UserRound,
  school: School,
  compass: Compass,
} as const;

function IconFor({ icon, className }: { icon?: string; className?: string }) {
  if (!icon) return null;
  const Icon = iconMap[icon as keyof typeof iconMap];
  if (!Icon) return null;
  return <Icon aria-hidden="true" className={cn('h-4 w-4', className)} />;
}

function DesktopMenu({ items, contactHref }: { items: NavMenu[]; contactHref: string }) {
  return (
    <div className="hidden items-center gap-3 lg:flex">
      <NavigationMenu>
        <NavigationMenuList>
          {items.map((item) => {
            if (!item.sections?.length && item.href) {
              return (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition hover:bg-accent hover:text-foreground"
                  >
                    <IconFor icon={item.icon} className="text-foreground/50" />
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            }

            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger className="rounded-full bg-transparent text-sm font-medium text-foreground/75 hover:bg-accent hover:text-foreground data-[state=open]:bg-accent/80">
                  <span className="inline-flex items-center gap-2">
                    <IconFor icon={item.icon} className="text-foreground/50" />
                    {item.label}
                  </span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[min(700px,calc(100vw-4.5rem))] gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    {item.sections?.map((section) => (
                      <div key={section.label} className="space-y-2 rounded-2xl border border-border/70 bg-card/80 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{section.label}</p>
                        <div className="space-y-1">
                          {section.items.map((sectionItem) => (
                            <a
                              key={sectionItem.label}
                              href={sectionItem.href}
                              className="group flex items-start gap-2 rounded-xl px-2 py-1.5 text-sm text-foreground/75 transition hover:bg-accent hover:text-foreground"
                            >
                              <IconFor icon={sectionItem.icon} className="mt-0.5 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                              <span>
                                <span className="block font-medium">{sectionItem.label}</span>
                                {sectionItem.description && (
                                  <span className="mt-0.5 block text-xs text-muted-foreground">{sectionItem.description}</span>
                                )}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <a href={contactHref} className={buttonVariants({ variant: 'default', size: 'sm' })}>
        Contact
      </a>
    </div>
  );
}

function MobileMenu({ items, contactHref }: { items: NavMenu[]; contactHref: string }) {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <button type="button" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Menu
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[94vw] max-w-sm border-l-border/70 bg-background/95 backdrop-blur">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-6 h-[calc(100dvh-10rem)] pr-4">
            <div className="space-y-3">
              {items
                .filter((item) => !item.sections?.length && item.href)
                .map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3 py-2.5 text-sm font-medium text-foreground/80"
                  >
                    <IconFor icon={item.icon} className="text-foreground/60" />
                    {item.label}
                  </a>
                ))}

              <Accordion type="multiple" className="w-full">
                {items
                  .filter((item) => item.sections?.length)
                  .map((item) => (
                    <AccordionItem key={item.label} value={item.label} className="rounded-xl border border-border/60 px-3">
                      <AccordionTrigger className="py-3 text-sm font-medium text-foreground/80 hover:no-underline">
                        <span className="inline-flex items-center gap-2">
                          <IconFor icon={item.icon} className="text-foreground/60" />
                          {item.label}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pb-3">
                        {item.sections?.map((section) => (
                          <div key={section.label} className="space-y-1.5 rounded-lg bg-muted/50 p-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                              {section.label}
                            </p>
                            {section.items.map((sectionItem) => (
                              <a
                                key={sectionItem.label}
                                href={sectionItem.href}
                                className="block rounded-md px-2 py-1.5 text-sm text-foreground/75 transition hover:bg-accent hover:text-foreground"
                              >
                                {sectionItem.label}
                              </a>
                            ))}
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </div>
          </ScrollArea>
          <a href={contactHref} className={cn(buttonVariants({ variant: 'default' }), 'mt-4 w-full')}>
            Contact
          </a>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function SiteNavigation({ items, contactHref, className }: SiteNavigationProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DesktopMenu items={items} contactHref={contactHref} />
      <MobileMenu items={items} contactHref={contactHref} />
    </div>
  );
}
