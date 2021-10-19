import React, { Component } from 'react'
import './App.css';

class AlphaVantage extends Component {
    constructor (props) {
        super(props)
        this.state = {
            id: ''
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const data = this.state
        console.log("final data is: ", data);
    }

    handleInputChange = (event) => {
        event.preventDefault();
        console.log(event);
        console.log(event.target.name + " " + event.target.value);
        this.setState({
            id: event.target.value
        })
    }

    componentDidMount(event) {
        this.setState({
            //[event.target.name]: event.target.value            
            //id: ''//'C542IZRPH683PFNZ'
        })
    }
    render () {
        const {name: id} = this.state;
        return (
            <div>
            <p>Enter id (get from www.alphavantage.co): {id} </p>
            <form onSubmit = {this.handleSubmit}>
                <input type='text' name='id' placeholder='enter alpha vintage id ...'
                        onChange={this.handleInputChange} value={this.state.id} />
               <button type="submit"> Enter </button>
            </form>
            </div>
        )
    }
}

export default AlphaVantage