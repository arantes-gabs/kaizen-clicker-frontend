import type { ReactNode } from 'react'
import type { HTMLMotionProps } from 'framer-motion'
import { motion } from 'framer-motion'
import { classNames } from '../../utils/classNames'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  isActive?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-emerald-300 bg-gradient-to-b from-emerald-300 to-emerald-400 text-emerald-950 shadow-[0_6px_0_#15976b,0_12px_20px_rgba(16,185,129,0.22)]',
  secondary:
    'border-amber-200 bg-gradient-to-b from-amber-200 to-amber-300 text-amber-950 shadow-[0_6px_0_#d08a09,0_12px_20px_rgba(251,191,36,0.2)]',
  ghost:
    'border-slate-200 bg-gradient-to-b from-white to-slate-100 text-slate-700 shadow-[0_5px_0_#cbd5e1,0_10px_18px_rgba(15,23,42,0.08)]',
  danger:
    'border-red-300 bg-gradient-to-b from-red-200 to-red-300 text-red-950 shadow-[0_6px_0_#d84d4d,0_12px_20px_rgba(248,113,113,0.2)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-14 px-6 text-base',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isActive = false,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={props.disabled ? undefined : { y: -2, scale: 1.02 }}
      whileTap={props.disabled ? undefined : { y: 4, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 520, damping: 24 }}
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-[1.35rem] border-2 font-extrabold transition duration-150 ease-out',
        'hover:brightness-105 active:shadow-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500',
        'disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-[0_3px_0_#d6dce5] disabled:hover:translate-y-0 disabled:hover:brightness-100',
        variantClasses[variant],
        sizeClasses[size],
        isActive && 'ring-2 ring-emerald-300 ring-offset-2 ring-offset-slate-50',
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
