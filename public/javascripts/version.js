console.log("Running puppyTree js.");

const ce = React.createElement
const csrfToken = document.getElementById("csrfToken").value;
const validateRoute = document.getElementById("validateRoute").value;
const createRoute = document.getElementById("createRoute").value;
const puppiesRoute = document.getElementById("puppiesRoute").value;
const logoutRoute = document.getElementById("logoutRoute").value;
const deleteRoute = document.getElementById("deleteRoute").value;
const addRoute = document.getElementById("addRoute").value;

class VersionMainComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loggedIn: false };
  }

  render() {
    if (this.state.loggedIn) {
      return ce(PuppyTreeComponent, { doLogout: () => this.setState( { loggedIn: false})});
    } else {
      return ce(LoginComponent, { doLogin: () => this.setState( { loggedIn: true }) });
    }
  }
}

class LoginComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: "",
      loginPass: "",
      createName: "",
      createPass: "",
      loginMessage: "",
      createMessage: ""
    };
  }

  render() {
    return ce('div', null,
      ce('h2', null, 'Login:'),
      ce('br'),
      'Username: ',
      ce('input', {type: "text", id: "loginName", value: this.state.loginName, onChange: e => this.changerHandler(e)}),
      ce('br'),
      'Password: ',
      ce('input', {type: "password", id: "loginPass", value: this.state.loginPass, onChange: e => this.changerHandler(e)}),
      ce('br'),
      ce('button', {onClick: e => this.login(e)}, 'Login'),
      ce('span', {id: "login-message"}, this.state.loginMessage),
      ce('h2', null, 'Create User:'),
      ce('br'),
      'Username: ',
      ce('input', {type: "text", id: "createName", value: this.state.createName, onChange: e => this.changerHandler(e)}),
      ce('br'),
      'Password: ',
      ce('input', {type: "password", id: "createPass", value: this.state.createPass, onChange: e => this.changerHandler(e)}),
      ce('br'),
      ce('button', {onClick: e => this.createUser(e)}, 'Create User'),
      ce('span', {id: "create-message"}, this.state.createMessage)
    );
  }

  changerHandler(e) {
    this.setState({ [e.target['id']]: e.target.value });
  }

  login(e) {
    const username = this.state.loginName;
    const password = this.state.loginPass;
    fetch(validateRoute, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Csrf-Token': csrfToken },
      body: JSON.stringify({ username, password })
    }).then(res => res.json()).then(data => {
      if(data) {
        this.props.doLogin();
      } else {
        this.setState({ loginMessage: "Login Failed" });
      }
    });
  }

  createUser() {
    const username = this.state.createName;
    const password = this.state.createPass;
    fetch(createRoute, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Csrf-Token': csrfToken },
      body: JSON.stringify({ username, password })
    }).then(res => res.json()).then(data => {
      if(data) {
        this.props.doLogin();
      } else {
        this.setState({ createMessage: "User Creation Failed"});
      }
    });
  }
}

class PuppyTreeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tasks: [], newTask: "", taskMessage: "" };
  }

  componentDidMount() {
    this.loadPuppies();
  }

  render() {
    return ce('div', null,
      'Puppy List',
      ce('br'),
      ce('ul', null,
        this.state.tasks.map(task => ce('li', { key: task.id, onClick: e => this.handleDeleteClick(task.id) }, task.text))
      ),
      ce('br'),
      ce('div', null,
        ce('input', {type: 'text', value: this.state.newTask, onChange: e => this.handleChange(e) }),
        ce('button', {onClick: e => this.handleAddClick(e)}, 'Add Puppy'),
        this.state.taskMessage
      ),
      ce('br'),
      ce('button', { onClick: e => this.props.doLogout() }, 'Log out')
    );
  }

  loadPuppies() {
    fetch(puppiesRoute).then(res => res.json()).then(tasks => this.setState({ tasks }));
  }

  handleChange(e) {
    this.setState({newTask: e.target.value})
  }

  handleAddClick(e) {
    fetch(addRoute, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Csrf-Token': csrfToken },
      body: JSON.stringify(this.state.newTask)
    }).then(res => res.json()).then(data => {
      if(data) {
        this.loadPuppies();
        this.setState({ taskMessage: "", newTask: "" });
      } else {
        this.setState({ taskMessage: "Failed to add." });
      }
    });
  }

  handleDeleteClick(i) {
    fetch(deleteRoute, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Csrf-Token': csrfToken },
      body: JSON.stringify(i)
    }).then(res => res.json()).then(data => {
      if(data) {
        this.loadPuppies();
        this.setState({ taskMessage: "" });
      } else {
        this.setState({ taskMessage: "Failed to delete."});
      }
    });
  }
}

ReactDOM.render(
  ce(VersionMainComponent, null, null),
  document.getElementById('react-root')
);