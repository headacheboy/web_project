import React from 'react';
import {
  AppBar, Toolbar, Typography, Grid, Button, Dialog, Input, Slide
} from '@material-ui/core';
import './TopBar.css';
import axios from 'axios';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
// 动画效果

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: props.view, 
      currentUser: props.currentUser,
      version: "1.0",
      uploadDialogOpen: false
    }
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleCloseDialog = () => {
    this.setState({uploadDialogOpen: false})
  }

  uploadButton = () => {
    if (this.state.currentUser == "guest"){
      window.alert("Please Login First");
      return;
    }
    this.setState({uploadDialogOpen: true});
  }

  componentDidUpdate = (prevProps) => {
    let updateObj = {};
    let flag = false;
    if (prevProps.view != this.props.view){
      updateObj['view'] = this.props.view;
      flag = true;
    }
    if (prevProps.currentUser != this.props.currentUser){
      updateObj['currentUser'] = this.props.currentUser;
      flag = true;
    }
    if (flag){
      this.setState(updateObj);
    }
  }

  handleLogout = (event) => {
    axios.post('admin/logout')
    .then(response => {
      console.log("logout");
      this.setState({currentUser: "guest"});
    })
    .catch(err => {
      throw err;
    });
    this.props.updateLoggedIn();
  }

  handleUpload = (event) => {
    event.preventDefault();
    if (this.uploadInput.files.length > 0){
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      // 将uploadInput.files[0]对应的文件放到'uploadedphoto'字段下，把domForm发出去
      axios.post('/photos/new', domForm)
        .then((response) => {
          console.log(response);
          this.setState({uploadDialogOpen: false});
        })
        .catch((err) => {
          console.log(`POST ERROR ${err}`);
        })
    }
  }

  // 

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" color='default' position="absolute">
        {/* AppBar是顶上的背景，toolbar是下一层的背景 */}
        <Toolbar>
          <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          >
            <Typography variant="h5" color="inherit">
                Hello, {this.state.currentUser}!
            </Typography>
            <Typography variant="body1">
                version: {this.state.version}
              </Typography>
            <Typography variant="body1">
              {this.state.view}
            </Typography>
            <Grid item>
              <Dialog TransitionComponent={Transition} open={this.state.uploadDialogOpen} onClose={this.handleCloseDialog.bind(this)}>
                {/* open表示是否打开当前Dialog，onClose表示关闭时操作 */}
                <form >
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={domFileRef => {
                        this.uploadInput = domFileRef;
                      }}
                    />
                  </label>
                <Button variant="contained" onClick={this.handleUpload}>Upload</Button>
                </form>
              </Dialog>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={this.uploadButton.bind(this)}>Upload</Button>
              <Button variant="outlined" onClick={this.handleLogout}>Logout</Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
