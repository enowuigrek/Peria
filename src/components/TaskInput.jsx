import { useState } from 'react'

export default function TaskInput({ onAdd }) {
    const [value, setValue] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (value.trim()) {
            onAdd(value.trim())
            setValue('')
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Dodaj zadanie..."
                style={{ padding: '0.5rem', width: '300px' }}
            />
            <button type="submit" style={{ marginLeft: '0.5rem' }}>Dodaj</button>
        </form>
    )
}