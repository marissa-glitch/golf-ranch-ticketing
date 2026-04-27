/** Teal-dark gradient placeholder with faint "GR" — used wherever hero images go */
export default function ImagePlaceholder({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-[#003d45] ${className}`}
      style={{
        background: 'linear-gradient(135deg, #003d45 0%, #00505b 60%, #003d45 100%)',
      }}
    >
      <span
        className="text-white/10 font-black select-none"
        style={{ fontSize: 'clamp(3rem, 15vw, 8rem)', letterSpacing: '-0.05em' }}
      >
        GR
      </span>
    </div>
  )
}
