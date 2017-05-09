import React from 'react'
import PropTypes from 'prop-types'

const TodoForm = ({onTodoSubmit}) => { 
    
    let input;
    
    return (
        <form onSubmit={(e) => onTodoSubmit(e, input)}>
            <input ref={node => { input = node }} />
            <button type="submit">
                Add Todo
            </button>
        </form>
    )
}

TodoForm.propTypes = {
    onTodoSubmit: PropTypes.func.isRequired
}

export default TodoForm