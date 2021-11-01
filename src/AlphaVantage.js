import React, { Component } from 'react'
import './App.css';

class AlphaVantage extends Component {
    constructor (props) {
        super(props)
        this.state = {
            id: ''
        }
        console.log('AlphaVantage constructor');
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.setState({
            id: event.target.value
        })
        console.log("final data is: ", this.state.id);
    }

    handleInputChange = (event) => {
        event.preventDefault();
        // console.log(event);
        // console.log(event.target.name + " " + event.target.value);
        this.setState({
            id: event.target.value
        })
    }

    componentDidMount(event) {
        console.log('AlphaVantage componentDidMount');
        this.setState({
            //[event.target.name]: event.target.value            
            //id: ''//'C542IZRPH683PFNZ'
        })
    }
    render () {
        console.log('AlphaVantage render');
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