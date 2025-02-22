import { useState, useReducer, useEffect } from "react";
import { produce } from "immer";

const getRandomId = () => Math.floor(Math.random() * 1000000);

const todoStorage = {
  get: () => {
    try {
      const tasks = localStorage.getItem("tasks");
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error("Error parsing tasks from localStorage", error);
      return [];
    }
  },
  set: (tasks) => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  },
};

const initialState = {
  tasks: todoStorage.get(),
  filter: "all",
};

const reducer = produce((draft, action) => {
  switch (action.type) {
    case "ADD_TASK": {
      draft.tasks = [
        ...draft.tasks,
        { id: getRandomId(), text: action.payload, isCompleted: false },
      ];
      break;
    }
    case "DELETE_TASK":
      draft.tasks = draft.tasks.filter((task) => task.id !== action.payload);
      break;
    case "TOGGLE_TASK":
      draft.tasks = draft.tasks.map((task) =>
        task.id === action.payload
          ? { ...task, isCompleted: !task.isCompleted }
          : task
      );
      break;
    case "SET_FILTER":
      draft.filter = action.payload;
      break;
    default:
      break;
  }
});

const MoreTodo = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [text, setText] = useState("");

  useEffect(() => {
    todoStorage.set(state.tasks);
  }, [state.tasks]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && text.trim() !== "") {
      dispatch({ type: "ADD_TASK", payload: text });
      setText("");
    }
  };

  const handleDelete = (id) => {
    dispatch({ type: "DELETE_TASK", payload: id });
  };

  const getFilteredTasks = () => {
    const { filter, tasks } = state;
    if (filter === "active") {
      return tasks.filter((task) => !task.isCompleted);
    }
    if (filter === "completed") {
      return tasks.filter((task) => task.isCompleted);
    }
    return tasks;
  };

  const toggleTaskCompletion = (id) => {
    dispatch({ type: "TOGGLE_TASK", payload: id });
  };

  return (
    <div className="wrapper">
      <h1>Learn React with Todo 🚀</h1>
      <input
        type="text"
        placeholder="Enter a task and press Enter"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="tasks-container">
        {getFilteredTasks().map((task) => (
          <div key={task.id} className="task">
            <button onClick={() => toggleTaskCompletion(task.id)}>
              {task.isCompleted ? "✓" : "○"}
            </button>
            <p className={task.isCompleted ? "completed" : ""}>{task.text}</p>
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="filter-buttons">
        <button
          onClick={() => dispatch({ type: "SET_FILTER", payload: "active" })}
        >
          Active
        </button>
        <button
          onClick={() => dispatch({ type: "SET_FILTER", payload: "completed" })}
        >
          Completed
        </button>
        <button
          onClick={() => dispatch({ type: "SET_FILTER", payload: "all" })}
        >
          All
        </button>
      </div>
    </div>
  );
};

export default MoreTodo;
