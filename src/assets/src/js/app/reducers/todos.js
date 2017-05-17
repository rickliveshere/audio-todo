const addTodo = (action) => {
    return {
        id: action.id,
        text: action.text,
        completed: false
    }
}

const toggleTodo = (todo, action) => {
    if (todo.id !== action.id)
        return todo;
    
    return Object.assign({}, todo, {
        completed: !todo.completed
    })
}

const todos = (state = [], action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [
                ...state,
                addTodo(action)
            ]
        case 'TOGGLE_TODO':
            return state.map(t => toggleTodo(t, action))
        default:
            return state;
    }
}

export default todos