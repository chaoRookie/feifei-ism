"use client"

import * as React from "react"
import { flushSync } from "react-dom"

const buttonSets = ["k1", "k2", "k3", "k4", "k5", "k6"] as const

type ButtonSet = (typeof buttonSets)[number]

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonSet
  primary?: boolean
  pressed?: boolean
  defaultPressed?: boolean
  toggle?: boolean
  onPressedChange?: (pressed: boolean) => void
  seal?: string
}

type Phase = "" | "pre" | "go"

const css = () => getComputedStyle(document.documentElement)

const ms = (name: string) => {
  const v = css().getPropertyValue(name).trim()
  const n = parseFloat(v)
  if (isNaN(n)) return 0
  return /ms$/.test(v) ? n : /s$/.test(v) ? n * 1000 : n
}

const ease = (name: string) => css().getPropertyValue(name).trim() || "linear"

const still = () =>
  typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches

const inView = (el: Element) => {
  const r = el.getBoundingClientRect()
  return r.bottom > 0 && r.top < innerHeight
}

function Button({
  variant = "k1",
  primary = false,
  pressed,
  defaultPressed = false,
  toggle = false,
  onPressedChange,
  seal,
  disabled,
  className,
  children,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  onKeyDown,
  onKeyUp,
  type = "button",
  ...props
}: ButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  const [own, setOwn] = React.useState(defaultPressed)
  const on = pressed ?? (toggle ? own : undefined)
  const [down, setDown] = React.useState(false)
  const t0 = React.useRef(0)
  const timer = React.useRef<number | undefined>(undefined)
  const [draw, setDraw] = React.useState<Phase>(
    variant === "k5" && !disabled ? "pre" : ""
  )
  const [slash, setSlash] = React.useState<Phase>("pre")
  const mounted = React.useRef(false)
  const was = React.useRef(on)

  const restart = React.useCallback((set: (p: Phase) => void) => {
    if (still()) {
      set("")
      return
    }
    flushSync(() => set(""))
    void ref.current?.offsetWidth
    set("go")
  }, [])

  const stamp = React.useCallback(() => {
    const b = ref.current
    const h = b?.querySelector<HTMLElement>(":scope > .ffh")
    if (!b || !h || still()) return
    h.getAnimations().forEach((a) => a.cancel())
    const drop = ease("--e-drop")
    const out = ease("--e-out")
    h.animate(
      [
        { transform: "rotate(-7deg) scale(1.5)", opacity: 0.2, filter: "brightness(1)", easing: drop },
        { transform: "rotate(-2.5deg) scale(.9)", opacity: 1, filter: "brightness(.55)", offset: 0.3, easing: out },
        { transform: "rotate(-2.5deg) scale(1.1,.84)", opacity: 1, filter: "brightness(.55)", offset: 0.55, easing: out },
        { transform: "rotate(-2.5deg) scale(1)", opacity: 1, filter: "brightness(1.4)", offset: 0.72 },
        { transform: "rotate(-2.5deg) scale(1)", opacity: 1, filter: "brightness(1)" },
      ],
      { duration: 680 }
    )
    b.animate(
      [
        { transform: "none" },
        { transform: "none", offset: 0.29 },
        { transform: "translateY(2px)", offset: 0.32, easing: out },
        { transform: "none", offset: 0.7 },
      ],
      { duration: 680 }
    )
  }, [])

  React.useEffect(() => {
    const b = ref.current
    const live = mounted.current
    mounted.current = true
    if (!b) return
    if (still() || typeof IntersectionObserver !== "function") {
      setDraw("")
      setSlash("")
      return
    }
    if (disabled && live && inView(b)) {
      const id = window.setTimeout(() => restart(setSlash), 0)
      return () => window.clearTimeout(id)
    }
    if (!disabled && variant !== "k5") return
    if (disabled) setSlash("pre")
    else setDraw("pre")
    let wait: number | undefined
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          io.disconnect()
          if (disabled) wait = window.setTimeout(() => restart(setSlash), 200)
          else restart(setDraw)
        }),
      { rootMargin: "0px 0px -12% 0px" }
    )
    io.observe(b)
    return () => {
      io.disconnect()
      window.clearTimeout(wait)
    }
  }, [disabled, variant, restart])

  React.useEffect(() => {
    if (!disabled) return
    const hit = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect()
      if (r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom)
        restart(setSlash)
    }
    document.addEventListener("pointerdown", hit, true)
    return () => document.removeEventListener("pointerdown", hit, true)
  }, [disabled, restart])

  React.useEffect(() => {
    if (variant === "k6" && on === true && was.current === false) stamp()
    was.current = on
  }, [on, variant, stamp])

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const press = () => {
    if (disabled) return
    window.clearTimeout(timer.current)
    t0.current = performance.now()
    setDown(true)
  }

  const release = () => {
    if (!down) return
    window.clearTimeout(timer.current)
    const left = Math.max(0, ms("--t-press-min") - (performance.now() - t0.current))
    timer.current = window.setTimeout(() => setDown(false), left)
  }

  const mark =
    seal ?? (typeof children === "string" ? children.trim().charAt(0) : "")

  const classes = [
    variant,
    primary && "p",
    down && "ffdown",
    variant === "k5" && draw === "pre" && "ffpre",
    variant === "k5" && draw === "go" && "ffdraw",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <button
      ref={ref}
      type={type}
      data-slot="button"
      data-variant={variant}
      disabled={disabled}
      aria-pressed={on}
      className={classes}
      onPointerDown={(e) => {
        press()
        onPointerDown?.(e)
      }}
      onPointerUp={(e) => {
        release()
        onPointerUp?.(e)
      }}
      onPointerCancel={(e) => {
        release()
        onPointerCancel?.(e)
      }}
      onPointerLeave={(e) => {
        release()
        onPointerLeave?.(e)
      }}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) press()
        onKeyDown?.(e)
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") release()
        onKeyUp?.(e)
      }}
      onClick={(e) => {
        if (disabled) return
        if (toggle || pressed !== undefined) {
          const next = !on
          if (pressed === undefined) setOwn(next)
          onPressedChange?.(next)
        }
        if (variant === "k5") restart(setDraw)
        if (variant === "k6" && on === undefined) stamp()
        onClick?.(e)
      }}
      {...props}
    >
      {variant === "k6" && mark ? (
        <span className="ffh" aria-hidden="true">
          {mark}
        </span>
      ) : null}
      {variant === "k5" ? <span className="fftx">{children}</span> : children}
      {disabled ? (
        <span
          className={["ffslash", slash === "pre" && "ffpre", slash === "go" && "ffgo"]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      ) : null}
    </button>
  )
}

export { Button, buttonSets }
export type { ButtonProps, ButtonSet }
