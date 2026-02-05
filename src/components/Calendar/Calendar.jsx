export default function Calendar() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            height: '100%',
            color: 'var(--text-muted, #6b7280)',
            textAlign: 'center',
            gap: '1rem'
        }}>
            <div style={{ fontSize: '4rem', opacity: 0.3 }}>📅</div>
            <h2 style={{
                fontSize: '1.5rem',
                margin: 0,
                color: 'var(--text-primary, #e5e7eb)',
                fontWeight: 600
            }}>
                Kalendarz
            </h2>
            <p style={{
                fontSize: '0.95rem',
                opacity: 0.7,
                margin: 0,
                maxWidth: '300px',
                lineHeight: 1.6
            }}>
                Ta funkcja będzie wkrótce dostępna
            </p>
        </div>
    )
}