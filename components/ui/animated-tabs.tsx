"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    activeValue: string
    hoveredValue: string | null
    setActiveValue: (value: string) => void
    setHoveredValue: (value: string | null) => void
}>({
    activeValue: "",
    hoveredValue: null,
    setActiveValue: () => { },
    setHoveredValue: () => { },
})

const Tabs = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ children, onValueChange, value, defaultValue, className, ...props }, ref) => {
    // We need to track the active value to drive the framer motion animation
    const [internalValue, setInternalValue] = React.useState(value || defaultValue || "")
    const [hoveredValue, setHoveredValue] = React.useState<string | null>(null)
    const uniqueId = React.useId()

    // Sync internal state if controlled value changes
    React.useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value)
        }
    }, [value])

    const contextValue = React.useMemo(() => ({
        activeValue: internalValue,
        hoveredValue,
        setActiveValue: (newVal: string) => {
            setInternalValue(newVal)
            onValueChange?.(newVal)
        },
        setHoveredValue,
    }), [internalValue, hoveredValue, onValueChange])

    return (
        <TabsContext.Provider value={contextValue}>
            <TabsPrimitive.Root
                ref={ref}
                value={internalValue}
                onValueChange={(val) => {
                    setInternalValue(val)
                    onValueChange?.(val)
                }}
                className={cn("flex flex-col gap-2", className)}
                {...props}
            >
                <LayoutGroup id={uniqueId}>
                    {children}
                </LayoutGroup>
            </TabsPrimitive.Root>
        </TabsContext.Provider>
    )
})
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl h-auto shadow-sm relative",
            className
        )}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, value, children, ...props }, ref) => {
    const { activeValue, hoveredValue, setHoveredValue } = React.useContext(TabsContext)
    const isActive = value === activeValue
    const isHovered = value === hoveredValue

    return (
        <TabsPrimitive.Trigger
            ref={ref}
            value={value}
            onMouseEnter={() => setHoveredValue(value)}
            onMouseLeave={() => setHoveredValue(null)}
            className={cn(
                "relative z-10 py-2 text-[10px] xs:text-xs sm:text-sm px-1 rounded-lg transition-colors duration-200",
                // Force transparent background because we use the motion div for it
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                "text-muted-foreground hover:text-foreground data-[state=active]:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                className
            )}
            {...props}
        >
            {/* Active State Bubble */}
            {isActive && (
                <motion.div
                    layoutId="active-bubble"
                    className="absolute inset-0 bg-background rounded-lg shadow-sm z-[-1]"
                    transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6
                    }}
                />
            )}

            {/* Hover State Bubble (only visible when hovering a non-active tab) */}
            <AnimatePresence>
                {isHovered && !isActive && (
                    <motion.div
                        layoutId="hover-bubble"
                        className="absolute inset-0 bg-muted-foreground/10 rounded-lg z-[-2]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6
                        }}
                    />
                )}
            </AnimatePresence>

            <span className="relative z-10">{children}</span>
        </TabsPrimitive.Trigger>
    )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
