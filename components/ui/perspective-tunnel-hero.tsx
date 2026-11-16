"use client";

import {
    motion,
    useTransform,
    useReducedMotion,
    useMotionValue,
    useSpring,
    MotionValue,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Cards link to real FluxPDF tools, each with a representative Unsplash photo.
const IMAGES = [
    { src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80", title: "Fill Forms", href: "/tools/fill-forms" },
    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", title: "Edit PDF", href: "/tools/edit" },
    { src: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=800&q=80", title: "Summarize", href: "/tools/summarize" },
    { src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80", title: "Redact", href: "/tools/redact" },
    { src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", title: "Protect", href: "/tools/protect" },
    { src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80", title: "Sign", href: "/tools/sign" },
    { src: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80", title: "Merge", href: "/tools/merge" },
    { src: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=800&q=80", title: "Translate", href: "/tools/translate" },
    { src: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80", title: "Compress", href: "/tools/compress" },
];


interface TunnelCardData {
    item: { src: string; title: string; href: string };
    angleCos: number;
    angleSin: number;
    radiusFactorX: number;
    radiusFactorY: number;
    rotationZ: number;
    index: number;
}

const TUNNEL_CARDS: TunnelCardData[] = IMAGES.map((item, i) => {
    const goldenAngle = i * 137.5 * (Math.PI / 180);
    const radiusFactorX = 0.28 + (i % 3) * 0.08;
    const radiusFactorY = 0.26 + (i % 2) * 0.09;

    return {
        item,
        angleCos: Math.cos(goldenAngle),
        angleSin: Math.sin(goldenAngle),
        radiusFactorX,
        radiusFactorY,
        rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
        index: i,
    };
});

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

interface StageDimensions {
    width: number;
    height: number;
    isMobile: boolean;
}

function useCameraParallax(enabled: boolean) {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const x = useSpring(rawX, SPRING_CONFIG);
    const y = useSpring(rawY, SPRING_CONFIG);

    useEffect(() => {
        if (!enabled) return;
        const onMove = (e: PointerEvent) => {
            rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
            rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, [enabled, rawX, rawY]);

    return { x, y };
}

interface TunnelCardProps {
    card: TunnelCardData;
    progress: MotionValue<number>;
    pointer: { x: MotionValue<number>; y: MotionValue<number> };
    total: number;
    stage: StageDimensions;
}

function TunnelCard({ card, progress, pointer, total, stage }: TunnelCardProps) {
    const staggerSpan = 0.55;
    const start = (card.index / total) * (1 - staggerSpan);
    const end = start + staggerSpan;

    const localProgress = useTransform(progress, [start, end], [0, 1]);
    // Cards are visible from the first frame (so the hero reads as a corridor even
    // before any scrolling), hold at full strength mid-flight, then dim as they pass
    // the camera so they don't cover the headline once they'd be huge in frame.
    const opacity = useTransform(
        localProgress,
        [0, 0.08, 0.22, 0.72, 0.9, 1],
        [0.42, 0.85, 1, 0.9, 0.55, 0]
    );

    const farZ = stage.isMobile ? -1200 : -1700;
    const nearZ = stage.isMobile ? 350 : 500;
    const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

    const cardWidth = stage.isMobile
        ? Math.max(130, Math.min(180, stage.width * 0.38))
        : Math.max(180, Math.min(270, stage.width * 0.18));

    const baseX = card.angleCos * (stage.width * card.radiusFactorX);
    const baseY = card.angleSin * (stage.height * card.radiusFactorY);
    const panStrength = stage.isMobile ? 20 : 45;

    const transform = useTransform(
        [z, pointer.x, pointer.y],
        ([currZ, px, py]: number[]) => {
            const offsetX = baseX - px * panStrength;
            const offsetY = baseY - py * panStrength;
            return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`;
        }
    );

    return (
        <motion.div
            style={{
                width: cardWidth,
                transform,
                opacity,
                zIndex: card.index + 1,
            }}
            className="pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none cursor-pointer"
        >
            <Link
                href={card.item.href}
                aria-label={`Open ${card.item.title}`}
                className="group relative block h-full w-full overflow-hidden rounded-xl bg-muted shadow-[0_24px_60px_-24px_rgba(20,21,26,0.45)] ring-1 ring-black/[0.08] transition-all duration-500 hover:ring-brand/60 dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] dark:ring-white/10"
            >
                <img
                    src={card.item.src}
                    alt={card.item.title}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Caption plate — glass chip keeps the label legible over any photo */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3 sm:p-4">
                    <span className="truncate text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-white/95">
                        {card.item.title}
                    </span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-brand/70 group-hover:bg-brand/25">
                        <ArrowRight className="h-3 w-3 text-white/80 transition-transform duration-300 group-hover:translate-x-px" />
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}

interface PerspectiveTunnelHeroProps {
    /** Eyebrow label above the headline. */
    eyebrow?: string;
    /** Primary headline, rendered as two lines. */
    title?: string;
    /** Supporting copy under the headline. */
    description?: string;
    /** Call-to-action label. */
    ctaLabel?: string;
    /** Call-to-action target. */
    ctaHref?: string;
    /** Extra classes merged onto the root viewport container. */
    className?: string;
}

export default function PerspectiveTunnelHero({
    eyebrow = "Warp Drive Sequence",
    title = "Into the Ether.",
    description = "Scroll your trackpad or mouse wheel to fly through the spatial 3D corridor.",
    ctaLabel = "Fix My Document",
    ctaHref = "/fix-document",
    className = "",
}: PerspectiveTunnelHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();

    const [stage, setStage] = useState<StageDimensions>({
        width: 1440,
        height: 900,
        isMobile: false,
    });

    useEffect(() => {
        const updateDimensions = () => {
            setStage({
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: window.innerWidth < 768,
            });
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Raw motion value controlled directly by mouse wheel / touch trackpad
    const rawProgress = useMotionValue(0);
    const smoothProgress = useSpring(rawProgress, {
        stiffness: 80,
        damping: 30,
        restDelta: 0.0001,
    });

    // Handle wheel scrolling locally inside the 100vh viewport container without page scroll
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const current = rawProgress.get();
            const delta = e.deltaY * 0.0008; // Adjust speed of tunnel travel here
            const next = Math.min(1, Math.max(0, current + delta));
            rawProgress.set(next);
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, [rawProgress]);

    // Respect prefers-reduced-motion: skip travel and present the tunnel already open.
    useEffect(() => {
        if (reduce) rawProgress.jump(0.35);
    }, [reduce, rawProgress]);

    const pointer = useCameraParallax(!reduce);

    const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.86, 1, 1.35]);
    // Start fully legible (this is a landing hero, not a splash) and only dim as the
    // viewer travels far into the tunnel.
    const titleOpacity = useTransform(smoothProgress, [0, 0.05, 0.85, 1], [1, 1, 1, 0]);
    const promptOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);

    // Split the headline into two stacked lines at its middle word so any provided
    // title ("Into the Ether." -> "Into the" / "Ether.") still balances visually.
    const words = title.trim().split(" ");
    const breakAt = Math.ceil(words.length / 2);
    const titleLine1 = words.slice(0, breakAt).join(" ");
    const titleLine2 = words.slice(breakAt).join(" ");

    return (
        <div
            ref={containerRef}
            className={`relative h-[100svh] w-full overflow-hidden bg-background text-foreground select-none flex items-center justify-center ${className}`}
            style={{
                perspective: stage.isMobile ? "900px" : "1200px",
                transformStyle: "preserve-3d",
            }}
        >
            {/* Immersive Background Grid & Glow */}
            <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 dark:opacity-70" />
            <div className="brand-glow pointer-events-none absolute inset-0" />
            {/* Vignette — pulls focus to the centre. Fades the same colour out through
                alpha steps (rather than `transparent`) so the gradient interpolates
                cleanly and doesn't band into a visible tint. */}
            <div className="vignette pointer-events-none absolute inset-0" />

            {/* Depth Ring Guides */}
            <div className="pointer-events-none absolute z-0 h-[48vmin] w-[48vmin] rounded-full border border-brand/20 dark:border-brand/15" />
            <div className="pointer-events-none absolute z-0 h-[76vmin] w-[76vmin] rounded-full border border-dashed border-foreground/[0.08]" />

            {/* Copy plate — a feathered pool of solid background colour layered BETWEEN the
                tunnel (z-10) and the headline (z-20). Cards travel behind it and stay visible
                around its feathered edges, but never cut through the type. */}
            <div className="copy-plate pointer-events-none absolute left-1/2 top-1/2 z-[15] h-[78vmin] w-[96vmin] max-w-[1040px] -translate-x-1/2 -translate-y-1/2" />

            {/* Central Anchor Typography — sits above the corridor but lets cards stay clickable */}
            <motion.div
                style={{ scale: titleScale, opacity: titleOpacity }}
                className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
            >
                <p className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-card/70 px-4 py-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-brand backdrop-blur-md mb-6 shadow-[0_1px_2px_rgba(20,21,26,0.04)]">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    {eyebrow}
                </p>
                <h1 className="text-[2.75rem] sm:text-7xl md:text-8xl font-semibold tracking-[-0.045em] leading-[0.92] px-2 bg-gradient-to-b from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                    {titleLine1.toUpperCase()}
                    <br />
                    {titleLine2.toUpperCase()}
                </h1>
                <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {description}
                </p>
                {/* Clickable CTAs — re-enable pointer events inside the non-interactive copy block */}
                <div className="pointer-events-auto mt-8 flex flex-col sm:flex-row items-center gap-3">
                    <Button size="lg" asChild className="group gap-2 btn-press pointer-events-auto">
                        <Link href={ctaHref}>
                            {ctaLabel}
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="gap-2 btn-press pointer-events-auto backdrop-blur-md">
                        <Link href="/tools">Explore All Tools</Link>
                    </Button>
                </div>
            </motion.div>

            {/* Scroll Prompt */}
            <motion.div
                style={{ opacity: promptOpacity }}
                className="pointer-events-none absolute bottom-8 z-30 hidden sm:flex flex-col items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.35em] text-muted-foreground"
            >
                <span>Scroll to Explore</span>
                <div className="h-7 w-px bg-gradient-to-b from-brand via-brand/40 to-transparent" />
            </motion.div>

            {/* 3D Z-Space Plane — z-10 keeps the corridor above the background layers
                and below the copy plate (z-15) and headline (z-20). */}
            <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{ transformStyle: "preserve-3d" }}
            >
                {TUNNEL_CARDS.map((card, i) => (
                    <TunnelCard
                        key={i}
                        card={card}
                        progress={smoothProgress}
                        pointer={pointer}
                        total={TUNNEL_CARDS.length}
                        stage={stage}
                    />
                ))}
            </div>
        </div>
    );
}
