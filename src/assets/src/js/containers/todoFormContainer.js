import { connect } from 'react-redux'
import { addTodo } from '../actions'
import TodoForm from '../components/todoForm'

const mapStateToProps = (state) => {
    return {}
}

const mapDispatchToProps = (dispatch) => {
    return {
        onTodoSubmit: (event, input) => {
            
            event.preventDefault();
            
            var text = input.value.trim();
            
            if (!text)
                return
            
            dispatch(addTodo(text))
                
            input.value = ''
        }
    }
}

const TodoFormContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(TodoForm)

export default TodoFormContainer