/* © 2026 JSM VALOR. All Rights Reserved. */

export default function ValorLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 select-none ${className}`}>
            {/* JSM Sign */}
            <span 
                className="text-primary font-serif italic tracking-tight translate-y-[2px]" 
                style={{ fontSize: "1.4em", lineHeight: 1, fontWeight: 700 }}
            >
                JSM
            </span>
            
            {/* VALOR Text part */}
            <div className="relative flex flex-col justify-end">
                <div className="flex items-baseline leading-none" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}>
                    <span className="text-foreground tracking-tight" style={{ fontSize: "1.4em" }}>VALOR</span>
                    <span className="text-red-500" style={{ fontSize: "1.4em" }}>.</span>
                </div>
            </div>
        </div>
    );
}
