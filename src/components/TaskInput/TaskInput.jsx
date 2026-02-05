import { useState, memo } from 'react'
import PropTypes from 'prop-types'
import styles from './TaskInput.module.scss'

function TaskInput({ onAdd }) {
    const [value, setValue] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (value.trim()) {
            onAdd(value.trim())
            setValue('')
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.taskForm}>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Dodaj zadanie..."
                className={styles.taskInput}
            />
            <button type="submit" className={styles.taskButton}>Dodaj</button>
        </form>
    )
}

TaskInput.propTypes = {
    onAdd: PropTypes.func.isRequired,
}

export default memo(TaskInput)