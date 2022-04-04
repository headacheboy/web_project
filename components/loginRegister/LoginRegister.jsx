import React from "react";
import { Grid, Typography, Input, TextField } from "@material-ui/core";
const axios = require("axios").default;

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleChangeInput = this.handleChangeInput.bind(this);
    this.state = {
      failedLogin: "",
      login_attempt: "",
      password_attempt: "",
      register_name_attempt: "",
      register_password_attempt: "",
      occupation: "",
      password_verify_attempt: "",
      location: "",
      description: "",
      failedRegister: "",
      first_name: "",
      last_name: ""
    };
  }
    
  handleLogin(event) {
    event.preventDefault;
    console.log("event target value: ", event);

    axios
      .post("admin/login", {
        login_name: this.state.login_attempt,
        password: this.state.password_attempt,
        withCredentials: true
      })
      .then(response => {
        //message 200
        this.setState({ failedLogin: "" });
        let user = response.data;
        this.props.updateLoggedIn(user);
        window.location.href = `#/users/${user._id}`;
        // 跳转至当前用户的用户主页。
      })
      .catch(err => {
        this.setState({ failedLogin: err.response.data });
      });
  }

  handleChangeInput(stateUpdate) {
    this.setState(stateUpdate);
  }

  handleRegister = event => {
    if (this.state.register_password_attempt != this.state.password_verify_attempt) {
      this.setState({failedRegister: "Passwords don't match"});
      return;
    }
    event.preventDefault();
    axios
      .post("/user", {
        login_name: this.state.register_name_attempt,
        password: this.state.register_password_attempt,
        occupation: this.state.occupation,
        location: this.state.location,
        description: this.state.description,
        first_name: this.state.first_name,
        last_name: this.state.last_name
      })
      .then(response => {
        //message 200
        this.setState({ failedRegister: "Sucessfully register, please login now" });
      })
      .catch(err => {
        this.setState({ failedRegister: err.response.data });
      });
  };

  render() {
    return (
      <Grid container justify="space-around">
        <Grid item>
          <Typography variant="h5" color="inherit">
            Login
          </Typography>

          <Typography variant="body1" color="error">
            {this.state.failedLogin}
          </Typography>

          <form onSubmit={this.handleLogin}>
            <label>
              <TextField
                required
                label="Username"
                type="text"
                value={this.state.login_attempt}
                onChange={event =>
                  this.handleChangeInput({ login_attempt: event.target.value })
                }
              />
            </label>
            <br />
            <label>
              <TextField
                required
                label="Password"
                type="Password"
                value={this.state.password_attempt}
                onChange={event =>
                  this.handleChangeInput({
                    password_attempt: event.target.value
                  })
                }
              />
            </label>
            {/* consider using Textfield from material UI */}

            <Input type="submit" value="Submit" />
          </form>
        </Grid>

        <Grid item>
          <Typography variant="h5">Register</Typography>
          <Typography variant="body1" color="error">
            {this.state.failedRegister}
          </Typography>
          <form onSubmit={this.handleRegister}>
            <label>
                {/* label 作用为改进鼠标可用性。如果你在 label 标签内点击文本，就会触发此控件。 */}
              <TextField
                required
                label="First name"
                type="text"
                value={this.state.first_name}
                onChange={event =>
                  this.handleChangeInput({ first_name: event.target.value })
                }
              />{" "}
            </label>
            <br />
            <label>
              <TextField
                required
                label="Last name"
                type="text"
                value={this.state.last_name}
                onChange={event =>
                  this.handleChangeInput({ last_name: event.target.value })
                }
              />{" "}
            </label>
            <br />
            <label>
              <TextField
                required
                label="Username"
                type="text"
                value={this.state.register_name_attempt}
                onChange={event =>
                  this.handleChangeInput({
                    register_name_attempt: event.target.value
                  })
                }
              />
            </label>
            <br />
            <label>
                {/* type="password" 输入会变星号 */}
              <TextField
                label="Password"
                required
                type="password"
                value={this.state.register_password_attempt}
                onChange={event =>
                  this.handleChangeInput({
                    register_password_attempt: event.target.value
                  })
                }
              />
            </label>
            <br />
            <label>
              <TextField
                label="Verify password"
                required
                error={
                  this.state.register_password_attempt !=
                  this.state.password_verify_attempt
                }
                type="password"
                value={this.state.password_verify_attempt}
                onChange={event =>
                  this.handleChangeInput({
                    password_verify_attempt: event.target.value
                  })
                }
              />
            </label>
            <br />
            <label>
              <TextField
                label="Where are you from?"
                type="text"
                value={this.state.location}
                onChange={event =>
                  this.handleChangeInput({ location: event.target.value })
                }
              />
            </label>
            <br />
            <label>
              <TextField
                label="Describe yourself"
                type="text"
                value={this.state.description}
                onChange={event =>
                  this.handleChangeInput({ description: event.target.value })
                }
              />
            </label>
            <br />
            <label>
              <TextField
                label="Occupation"
                type="text"
                value={this.state.occupation}
                onChange={event =>
                  this.handleChangeInput({ occupation: event.target.value })
                }
              />
            </label>
            <Input type="submit" value="Register Me!" />
          </form>
        </Grid>
      </Grid>
    );
  }
}

export default LoginRegister;