import React, { Component } from 'react';

import './index.css';
import DemoBackground from './demo.png';
import Icon from '../../Icons/icon.png';

export default class LoginPage extends Component {
    componentDidMount()
    {
        if(localStorage.getItem("name") != null)
        {
            window.location.assign(window.location.origin + '/dashboard')
        }
    }

    checkdetail = async () =>
    {
        const uniquenumber = document.getElementsByClassName('uniquenumber')[0].value;
        const password = document.getElementsByClassName('password')[0].value;
        const consoleEle = document.getElementById('console');

        if(uniquenumber.length === 0){consoleEle.innerText = "Fill unique number field";  return;}
        if(password.length === 0){consoleEle.innerText = "Fill password field"; return;}

        var result = await fetch(`http://localhost:8000/checkuserlogindetail?unique=${uniquenumber}&pass=${password}`);
        result = await result.json();
        var resultStatus = result["status"];

        if(resultStatus === "Success"){consoleEle.innerText = resultStatus; localStorage.setItem("uniquenumber", uniquenumber); localStorage.setItem("name", result["name"]); localStorage.setItem("post", result["post"]);  setInterval(()=>{window.location.assign(window.location.origin + '/dashboard')},1500)}
        else if(resultStatus === "User does not exist"){consoleEle.innerText = resultStatus;}
        else if(resultStatus === "Password does not matched"){consoleEle.innerText = resultStatus;}
        else{consoleEle.innerText = "Something went wrong."}
    }

    render() {
        return (
            <div id="loginpage">
                <div id="centercard">
                    <img id='icon' src={Icon} alt="Icon" width="60px" height="60px" />
                    <div id="cardtitle">Departmental Library Management System</div>
                    
                    <div style={{margin: "20px 0 20px 0", color: "white"}}>.</div>

                    <div id="cardinput">
                        <input className='uniquenumber' id="cardinputfield" type="text" placeholder=" " onClick={()=>{document.getElementById('console').innerText=""}} />
                        <span id="cardinputname">Unique Number</span>
                    </div>

                    <div id="cardinput">
                        <input className='password' id="cardinputfield" type="password" placeholder=" " onClick={()=>{document.getElementById('console').innerText=""}} />
                        <span id="cardinputname">Password</span>
                    </div>
                
                    <div id="loginbuttondiv">
                        <input type="button" value="Login" id="loginbutton" onClick={this.checkdetail} />
                    </div>

                    <div id="console" style={{fontSize: "15px", marginLeft: "50%", transform: "translateX(-50%)", textAlign: "center"}}></div>
                </div>
            </div>
        );
    }
}