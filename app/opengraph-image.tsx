import { ImageResponse } from 'next/og'

export const alt = 'Elyon Schools — Excellence in Education Since 1994'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern dots */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '60px 80px',
            textAlign: 'center',
          }}
        >
          {/* School crest / emblem placeholder */}
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '3px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
            }}
          >
            🎓
          </div>

          {/* School name */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: '900',
              color: '#ffffff',
              letterSpacing: '-2px',
              lineHeight: 1,
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}
          >
            Elyon Schools
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: '400',
              color: '#bbf7d0',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            Excellence in Education Since 1994
          </div>

          {/* Divider */}
          <div
            style={{
              width: '120px',
              height: '3px',
              background: '#fbbf24',
              borderRadius: '2px',
            }}
          />

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '60px',
              marginTop: '8px',
            }}
          >
            {[
              { value: '30+', label: 'Years' },
              { value: '1,500+', label: 'Students' },
              { value: '120+', label: 'Teachers' },
              { value: '98%', label: 'Success Rate' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#fbbf24',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#d1fae5',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '1px',
          }}
        >
          elyonschools.edu.ng
        </div>
      </div>
    ),
    { ...size }
  )
}
