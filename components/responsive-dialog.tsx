"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useMediaQuery } from "@base-ui/react/unstable-use-media-query";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type ResponsiveDialogContextValue = {
  isMobile: boolean;
};

const ResponsiveDialogContext = React.createContext<ResponsiveDialogContextValue | null>(null);

function useResponsiveDialogContext() {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context) {
    throw new Error("ResponsiveDialog components must be used within ResponsiveDialog.");
  }
  return context;
}

function ResponsiveDialog({
  children,
  ...props
}: DialogPrimitive.Root.Props & React.ComponentProps<typeof Drawer>) {
  const isMobile = useMediaQuery("(max-width: 639px)", { defaultMatches: false });

  return (
    <ResponsiveDialogContext.Provider value={{ isMobile }}>
      {isMobile ? (
        <Drawer data-slot="responsive-dialog" {...props}>
          {children}
        </Drawer>
      ) : (
        <DialogPrimitive.Root data-slot="responsive-dialog" {...props}>
          {children}
        </DialogPrimitive.Root>
      )}
    </ResponsiveDialogContext.Provider>
  );
}

type ResponsiveDialogTriggerProps = Omit<
  DialogPrimitive.Trigger.Props,
  "children" | "render" | "className" | "style"
> & {
  children: React.ReactNode;
  className?: string;
  render?: React.ReactElement;
  style?: React.CSSProperties;
};

function ResponsiveDialogTrigger({
  children,
  render,
  className,
  ...props
}: ResponsiveDialogTriggerProps) {
  const { isMobile } = useResponsiveDialogContext();
  const triggerChild = React.isValidElement(render)
    ? React.cloneElement(render, undefined, children)
    : children;

  return isMobile ? (
    <DrawerTrigger data-slot="responsive-dialog-trigger" asChild {...props} className={className}>
      {React.isValidElement(triggerChild) ? triggerChild : <span>{triggerChild}</span>}
    </DrawerTrigger>
  ) : (
    <DialogPrimitive.Trigger
      data-slot="responsive-dialog-trigger"
      render={
        React.isValidElement(render) ? React.cloneElement(render, undefined, children) : render
      }
      className={className}
      {...props}
    >
      {!React.isValidElement(render) ? children : null}
    </DialogPrimitive.Trigger>
  );
}

function ResponsiveDialogClose(
  props: DialogPrimitive.Close.Props & React.ComponentProps<typeof DrawerClose>,
) {
  const { isMobile } = useResponsiveDialogContext();

  return isMobile ? (
    <DrawerClose data-slot="responsive-dialog-close" {...props} />
  ) : (
    <DialogPrimitive.Close data-slot="responsive-dialog-close" {...props} />
  );
}

function ResponsiveDialogContent({
  className,
  children,
  showCloseButton = true,
  drawerClassName,
  dialogClassName,
}: {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  drawerClassName?: string;
  dialogClassName?: string;
}) {
  const { isMobile } = useResponsiveDialogContext();

  if (isMobile) {
    return (
      <DrawerContent
        data-slot="responsive-dialog-content"
        className={cn(
          "overflow-hidden data-[vaul-drawer-direction=bottom]:max-h-[85vh]",
          drawerClassName,
          className,
        )}
      >
        {children}
      </DrawerContent>
    );
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="responsive-dialog-overlay"
        className="fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <DialogPrimitive.Popup
        data-slot="responsive-dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 flex w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-popover p-0 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none shadow-xl sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          dialogClassName,
          className,
        )}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="responsive-dialog-close"
            render={
              <Button variant="ghost" className="absolute right-3 top-3 z-10" size="icon-sm" />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function ResponsiveDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveDialogContext();

  if (isMobile) {
    return (
      <DrawerHeader
        data-slot="responsive-dialog-header"
        className={cn(
          "shrink-0 gap-1.5 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] text-left",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="responsive-dialog-header"
      className={cn("flex shrink-0 flex-col gap-2 px-6 pt-6", className)}
      {...props}
    />
  );
}

function ResponsiveDialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="responsive-dialog-body"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-2",
        className,
      )}
      {...props}
    />
  );
}

function ResponsiveDialogFooter({ className, children, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveDialogContext();

  if (isMobile) {
    return (
      <DrawerFooter
        data-slot="responsive-dialog-footer"
        className={cn(
          "mt-auto shrink-0 gap-2 border-t border-border/60 bg-muted/20 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] [&>*]:w-full",
          className,
        )}
        {...props}
      >
        {children}
      </DrawerFooter>
    );
  }

  return (
    <div
      data-slot="responsive-dialog-footer"
      className={cn(
        "mt-auto flex shrink-0 flex-col-reverse gap-2 border-t border-border/60 bg-muted/35 px-6 py-4 sm:flex-row sm:justify-end sm:[&>*]:w-auto",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ResponsiveDialogTitle(
  props: DialogPrimitive.Title.Props & React.ComponentProps<typeof DrawerTitle>,
) {
  const { isMobile } = useResponsiveDialogContext();

  return isMobile ? (
    <DrawerTitle
      data-slot="responsive-dialog-title"
      className={cn("font-heading text-base leading-none font-medium", props.className)}
      {...props}
    />
  ) : (
    <DialogPrimitive.Title
      data-slot="responsive-dialog-title"
      className={cn("font-heading text-base leading-none font-medium", props.className)}
      {...props}
    />
  );
}

function ResponsiveDialogDescription(
  props: DialogPrimitive.Description.Props & React.ComponentProps<typeof DrawerDescription>,
) {
  const { isMobile } = useResponsiveDialogContext();

  return isMobile ? (
    <DrawerDescription
      data-slot="responsive-dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        props.className,
      )}
      {...props}
    />
  ) : (
    <DialogPrimitive.Description
      data-slot="responsive-dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        props.className,
      )}
      {...props}
    />
  );
}

export {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
};
