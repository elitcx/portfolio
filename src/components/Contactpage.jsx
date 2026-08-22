import React from 'react';
import { useReveal } from '../hooks/UseReveal.js';
import { contactLinks, iconSrc, CV } from '../utils/Constants.js';

export default function ContactPage() {
  const reveal = useReveal();

  return (
    <section
      data-screen-label="Contact"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '150px 24px 110px',
        background: 'var(--bg)',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <span
            style={{
              fontFamily: 'var(--label)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--dim)',
            }}
          >
            Get in touch
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span
            style={{
              fontFamily: 'var(--label)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--faint)',
            }}
          >
            Surakarta, ID
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontSize: 'clamp(3.2rem, 10.5vw, 8.6rem)',
            lineHeight: 0.86,
            letterSpacing: '-0.02em',
          }}
        >
          Let's Connect
        </h1>

        <p
          style={{
            margin: '34px 0 0',
            maxWidth: '52ch',
            fontSize: 'clamp(1.02rem, 1.35vw, 1.2rem)',
            lineHeight: 1.7,
            color: 'var(--mut)',
            textWrap: 'pretty',
          }}
        >
          I'm currently looking for university scholarship opportunities. If you're on an admissions team, hiring, or just want to talk about code, email is the fastest way to reach me.
        </p>

        <a
          data-reveal
          ref={reveal}
          href={CV.href}
          download={CV.filename}
          className="kj-more"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 34,
            padding: '16px 32px',
            border: '1px solid var(--fg)',
            borderRadius: 999,
            background: 'var(--fg)',
            color: 'var(--bg)',
            textDecoration: 'none',
            fontFamily: 'var(--label)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
          }}
        >
          {CV.label}
          <span aria-hidden="true" style={{ opacity: 0.7 }}>↓</span>
        </a>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
            columnGap: 28,
            rowGap: 8,
            marginTop: 64,
            borderTop: '1px solid var(--line)',
          }}
        >
          {contactLinks.map((c) => (
            <a
              key={c.label}
              data-reveal
              ref={reveal}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="kj-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '28px 16px',
                marginLeft: -16,
              }}
            >
              <img
                src={iconSrc(c.icon)}
                alt=""
                aria-hidden="true"
                width="26"
                height="26"
                decoding="async"
                style={{ width: 26, height: 26, flexShrink: 0, objectFit: 'contain', filter: c.flip }}
              />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 19, letterSpacing: '0.01em', color: 'var(--fg)' }}>
                  {c.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--label)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                    // Every handle is a label except the email, which is a literal
                    // address: uppercasing it makes a real string look mistyped.
                    textTransform: c.href.startsWith('mailto:') ? 'none' : 'uppercase',
                    color: 'var(--dim)',
                  }}
                >
                  {c.handle}
                </span>
              </span>
              <span aria-hidden="true" style={{ marginLeft: 'auto', fontSize: 20, color: 'var(--dim)' }}>→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
