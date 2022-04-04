import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@material-ui/core';
import './styles/main.css';
import cookie from 'react-cookies';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/loginRegister/LoginRegister';
import axios from 'axios';
import RateComponent from './components/rateComponent/RateComponent';


class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "HOME", 
      userIsLoggedIn: false,
      currentUser: "guest",
      loading: true,
    }
    this.updateView = this.updateView.bind(this); 
    // 将这个函数作为props输入
    this.updateLoggedIn = this.updateLoggedIn.bind(this);
    axios
      .post("admin/login", {
      })
      .then(response => {
        //message 200
        let user = response.data;
        this.updateLoggedIn(user);
        this.setState({loading: false});
        // window.location.href = `#/users/${user._id}`;
        // 跳转至当前用户的用户主页。
      })
      .catch(err => {
        this.setState({loading: false});
      });
  }

  updateView = (newView, name) => {
    this.setState({view: newView + name});
  }

  updateLoggedIn = (user)=>{
    console.log(user);
    if (user){
      if (this.state.userIsLoggedIn){
        this.setState({userIsLoggedIn: false, currentUser: 'guest'});
      }
      else{
        this.setState({userIsLoggedIn: !this.state.userIsLoggedIn, currentUser: user.first_name});
      }
    }
    else{
      this.setState({userIsLoggedIn: false, currentUser: 'guest'});
    }
    console.log(this.state.userIsLoggedIn, this.state.currentUser);
  }

  render() {
    return (!this.state.loading) ? (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar view={this.state.view} updateLoggedIn={this.updateLoggedIn} currentUser={this.state.currentUser} />
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper className="cs142-main-grid-item">
            <UserList userIsLoggedIn={this.state.userIsLoggedIn} />
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
              {
                this.state.userIsLoggedIn ?
                  <Route path="/users/:userId"
                    render={ props => <UserDetail {...props} updateView={this.updateView} /> }
                  />
                :
                  <Redirect path="/users/:userId" to="/login-register" />
              }
              {
                this.state.userIsLoggedIn ?
                  <Route path="/photos/:userId"
                    render ={ props => <UserPhotos {...props} updateView={this.updateView} /> }
                  />
                :
                  <Redirect path="/photos/:userId" to="/login-register" />
              }
              <Route path="/users" 
                render={ props => <UserList {...props} userIsLoggedIn={this.state.userIsLoggedIn} />}  />

              <Route path="/login-register" 
                render={ props => <LoginRegister {...props} updateLoggedIn={this.updateLoggedIn} /> } 
              />
              <Route path="/rating" render={props => <RateComponent {...props} />} />
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
      </HashRouter>
    ) : <div />;
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
