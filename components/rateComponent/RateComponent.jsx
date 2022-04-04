import React from 'react';
import { Grid, Typography, Button} from "@material-ui/core";
import Rating from '@material-ui/lab/Rating';
import { Link } from "react-router-dom";
import axios from 'axios';

class RateComponent extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: 2.5
        }
    }

    handleRating = (event) => {
        console.log(event.target.value);
        this.setState({value: event.target.value});
    }

    handleSubmit = (event) => {
        axios.post("/rating", {
            rate: this.state.rate
        })
        .then((response) => {
            window.alert("submit finish");
        })
        .catch((err) => {
            console.log(`POST ERROR ${err}`);
          });
    }

    render() {
        return (
        <Grid container justify="space-evenly" alignItems="flex-start" >
            <Grid item>
                <Typography component="legend">Controlled</Typography>
                <Rating
                    name="simple-controlled"
                    value={this.state.value}
                    onChange={this.handleRating.bind(this)}
                    />
            </Grid>
            <Grid item>
                <Button className="submit" variant='contained' onClick={this.handleSubmit.bind(this)} > Submit </Button>
            </Grid>
        </Grid>
        );
    }

}

export default RateComponent;
