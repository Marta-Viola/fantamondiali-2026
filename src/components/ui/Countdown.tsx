'use client'

import { useState, useEffect, useCallback } from 'react'

interface CountdownProps {
    targetDate: Date | string
    onEnd?: () => void
    variant?: 'default' | 'compact' | 'outline'
}

export default function Countdown({ targetDate, onEnd, variant = 'default' }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false
    })

    const calculateTime = useCallback(() => {
        const target = new Date(targetDate).getTime()
        const now = new Date().getTime()
        const difference = target - now

        if (difference <= 0) {
            if (!timeLeft.isExpired && onEnd) onEnd()
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            isExpired: false
        }
    }, [targetDate, onEnd, timeLeft.isExpired])

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTime())
        }, 1000)

        return () => clearInterval(timer)
    }, [calculateTime])

    if (timeLeft.isExpired) return null

    // classi dinamiche in base alla variante scelta
    const containerClasses = {
        default: "flex gap-3 justify-center",
        compact: "flex gap-2 items-baseline",
        outline: "flex gap-3 justify-center p-4 border-2 border-dashed border-white/30 rounded-2xl"
    }

    const boxClasses = {
        default: "bg-black/20 backdrop-blur-sm min-w-[50px] p-2 rounded-xl flex flex-col items-center border border-white/10",
        compact: "flex items-baseline gap-1",
        outline: "flex flex-col items-center"
    }

    const numberClasses = {
        default: "text-xl font-black leading-none",
        compact: "text-sm font-black leading-none",
        outline: "text-2xl font-black leading-none"
    }

    const labelClasses = {
        default: "text-[8px] uppercase font-bold opacity-70 mt-1 tracking-tighter",
        compact: "text-[9px] uppercase font-black opacity-50",
        outline: "text-[9px] uppercase font-bold opacity-60 mt-1"
    }

    const TimeUnit = ({ value, label }: { value: number, label: string }) => (
        <div className={boxClasses[variant]}>
            <span className={numberClasses[variant]}>
                {value.toString().padStart(2, '0')}
            </span>
            <span className={labelClasses[variant]}>{label}</span>
        </div>
    )

    return (
        <div className={containerClasses[variant]}>
            {timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label="gg" />}
            <TimeUnit value={timeLeft.hours} label="ore" />
            <TimeUnit value={timeLeft.minutes} label="min" />
            <TimeUnit value={timeLeft.seconds} label="sec" />
        </div>
    )
}