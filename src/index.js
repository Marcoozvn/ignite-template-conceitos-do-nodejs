const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(item => item.username === username);

  if (user) {
    request.user = user;
    return next();
  }

  return response.status(404).json({
    error: 'Mensagem do erro'
  });
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  let user = users.find(item => item.username === username);

  if (user) {
    return response.status(400).send({error: 'Mensagem do erro'});
  }

  user = {
    name, 
    username, 
    id: uuidv4(),
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  const todo = {
    id: uuidv4(),
    title, 
    deadline: new Date(deadline), 
    done: false,
    created_at: new Date()
  };

  const newUser = {
    ...user,
    todos: [...user.todos, todo]
  }
  users[users.indexOf(user)] = newUser;

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const user = request.user;

  const todoIndex = user.todos.findIndex(item => item.id === id);

  if (todoIndex > -1) {

    const newTodo = {
      ...user.todos[todoIndex],
      title,
      deadline: new Date(deadline)
    };

    user.todos[todoIndex] = newTodo;
    users[users.indexOf(user)] = user;
    
    return response.json(newTodo);
  }

  return response.status(404).send({
    error: 'Mensagem do erro'
  });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;


  const todoIndex = user.todos.findIndex(item => item.id === id);

  if (todoIndex >= 0) {
    const newTodo = {
      ...user.todos[todoIndex],
      done: true
    };

    user.todos[todoIndex] = newTodo;
    users[users.indexOf(user)] = user;

    return response.json(newTodo);
  }

  return response.status(404).send({
    error: 'Mensagem do erro'
  });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const todoIndex = user.todos.findIndex(item => item.id === id);

  if (todoIndex >= 0) {
    user.todos.splice(todoIndex, 1);
    return response.status(204).send();
  }

  return response.status(404).send({
    error: 'Mensagem do erro'
  });
});

module.exports = app;