import React, { Component } from 'react';

import './index.css';
import './bookcss.css';
import './searchcss.css';
import './reportcss.css';
import './borrowcss.css';
import Icon from '../../Icons/icon.png';
import Background from './background.jpg';
import PosterDemo from './posterdemo.jpg';

export default class Main extends Component {
    constructor(props)
    {
        super(props);  

        this.state = {
            book: [],
            searchBook: [],

            borrowname: '',
            borrowdesc: '',
            borrowbarcode: '',
            borrowdate: '',
            urlPosterBorrow: '',

            reportData: []
        }
    }

    async componentDidMount()
    {
        if(localStorage.getItem("name") == undefined) { window.location.assign(window.location.origin); }

        document.getElementById('borrowtab').className = "borrowtabclose";

        var bookData = await fetch('http://localhost:8000/getbook');
        bookData = await bookData.json();
        this.setState({book : bookData});

        var reportData = await fetch('http://localhost:8000/reportData?uniquenumber=' + localStorage.getItem("uniquenumber"));
        reportData = await reportData.json();
        reportData = reportData['bookData'];
        this.setState({reportData});
    }

    SetBookGallery = () =>
    {
        return (<div id="bookgallery">
            {this.state.book.bookData.map((book, i) => (
                <div className={book.barcode} key={book.barcode} id="bookitem" style={{backgroundImage: `url(${book.urlPoster.length === 0 ? PosterDemo : book.urlPoster})`}}>
                    <div id="bookitemoverlay"></div>
                    <div id="booktitle">{book.name}</div>
                    <div id="bookdescription">{book.description}</div>
                    <input type="button" value="BORROW NOW" id="bookborrowbutton" onClick={event => {this.borrowclick(event)}}/>
                </div>
            ))}</div>)
    } 

    borrowclick = async (event) =>
    {
        this.setState({ urlPosterBorrow: event.target.offsetParent.style.backgroundImage.replace('url(\"','').replace('\")',''), borrowname : event.target.offsetParent.childNodes[1].innerText, borrowdesc: event.target.offsetParent.childNodes[2].innerText, borrowbarcode: event.target.offsetParent.className})
        document.getElementById('borrowtab').className = "borrowtabopen";

        const borrowbuttonele = document.getElementById('borrowbutton');
        borrowbuttonele.value = "";
        borrowbuttonele.style.pointerEvents = "none";
        borrowbuttonele.style.backgroundColor = "orange";

        var borrowResult = await fetch(`http://localhost:8000/checkborrow?barcode=${event.target.offsetParent.className}&uniquenumber=${localStorage.getItem("uniquenumber")}`)
        borrowResult = await borrowResult.json();
        
        if(borrowResult["message"] === "no")
        {
            borrowbuttonele.value = "Borrow";
            borrowbuttonele.style.pointerEvents = "auto";
            borrowbuttonele.style.opacity = 1;
        }
        else
        { 
            var borrowedDate = new Date(borrowResult["date"]);
            const date = borrowedDate.toLocaleDateString() + " at " + borrowedDate.toLocaleTimeString();
            setTimeout(()=>{this.setState({borrowdate: date})},1000);

            borrowbuttonele.style.opacity = 0;
            borrowbuttonele.style.pointerEvents = "none";
        }
    }

    borrowClickedbook = async () => 
    {
        var status = await fetch('http://localhost:8000/borrowbook?barcode=' + this.state.borrowbarcode + '&uniquenumber=' + localStorage.getItem("uniquenumber"));
        status = await status.json();

        const borrowbuttonele = document.getElementById('borrowbutton');

        if(status["message"] === "Sucess")
        {
            borrowbuttonele.value = "Borrowed Success";
            borrowbuttonele.style.pointerEvents = "none";
            borrowbuttonele.style.backgroundColor = "#FFD580";

            setTimeout(() => {
                window.location.reload();
            }, 1500);   
        }
        else
        {
            borrowbuttonele.value = "Try Again!";
        }
    }

    findBook = () => 
    {
        const searchValue = document.getElementById('searchinput').value;
        if(searchValue === ""){this.setState({searchBook:[]}); document.getElementById('searchconsole').innerText = ""}
        if(searchValue.length < 3){return;}
        
        setTimeout(async ()=>{
            if(document.getElementById('searchinput').value === searchValue)
            {
                document.getElementById('searchconsole').innerText = "Searching in books for \"" + searchValue + "\"";
                var foundbook = await fetch(`http://localhost:8000/findbook?name=${searchValue}`);
                foundbook = await foundbook.json();
                console.log(foundbook);
                
                if(foundbook.bookData.length === 0)
                {
                    document.getElementById('searchconsole').innerText = "Sorry, The book \"" + searchValue + "\" is not available right now."; 
                    this.setState({searchBook:[]});
                }
                else
                    this.setState({searchBook: foundbook});
            }
        }, 1500);
    }

    SetSearch = () =>
    {
        return (<div id="bookgallery">
            {this.state.searchBook.bookData.map((book, i) => (
                <div className={book.barcode} key={book.barcode} id="bookitem" style={{backgroundImage: `url(${book.urlPoster.length === 0 ? PosterDemo : book.urlPoster})`}}>
                    <div id="bookitemoverlay"></div>
                    <div id="booktitle">{book.name}</div>
                    <div id="bookdescription">{book.description}</div>
                    <input type="button" value="BORROW NOW" id="bookborrowbutton" onClick={this.borrowclick}/>
                </div>
            ))}</div>)
    }

    SetReportData = () => 
    {
        return (<tbody>
            {this.state.reportData.map((book, i) => (
                <tr key={i}>
                    <td>{i+1}</td>
                    <td style={{fontWeight: "bold"}}>{book.bookdetail[0].name}</td>
                    <td>{book.bookdetail[0].description}</td>
                    <td>{book.barcode}</td>
                    <td>{this.GetDateFromFullDate(book.date)}</td>
                    <td>{this.GetTimeFromFullDate(book.date)}</td>
                    <td><input type='button' id="returnbutton" value="Return Book" onClick={async ()=>{if(window.confirm("Do you want to return " + book.bookdetail[0].name + " ?")){var result = await fetch('http://localhost:8000/returnbook?barcode=' + book.barcode + '&uniquenumber=' + localStorage.getItem("uniquenumber")); window.location.reload();}else{console.log("Cancelled")}}} /></td>
                    <td>{this.CheckDateDifferecneReportStatus(book.date)}</td>
                </tr>
            ))}</tbody>)
    }

    CheckDateDifferecneReportStatus(date)
    {
        const date1 = new Date(date);
        const date2 = new Date();
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        console.log(diffDays + " days");

        if(diffDays > 45)
        {
            return "Over Late";
        }
        else if(diffDays > 30)
        {
            return "Late";
        }
        else if(diffDays > 25)
        {
            return "Please Return";
        }
        else
        {
            return "Normal";
        }
    }

    GetDateFromFullDate(date)
    {
        var borrowedDate = new Date(date);
        return (borrowedDate.toLocaleDateString());
    }

    GetTimeFromFullDate(date)
    {
        var borrowedDate = new Date(date);
        return (borrowedDate.toLocaleTimeString());
    }

    render() {
        return (
            <div id="mainpage">
                <div id="navbar">
                    <a href='#loginbackground'><div id="navbaritem">Home</div></a>
                    <a href='#booktab'><div id="navbaritem">Book</div></a>
                    <a href='#searchtab'><div id="navbaritem">Search</div></a>
                    <a href='#reporttab'><div id="navbaritem">Report</div></a>
                    <div id="navbaritem" onClick={()=>{localStorage.clear(); window.location.assign(window.location.origin);}}>Logout</div>
                </div>

                <div id="loginbackground" style={{"--backgroundImage" : `url(${Background})`}}>
                    <div id="leftnavoption">
                        <img src={Icon} alt="icon" width="70px" height="70px" style={{marginLeft: "2em"}} />
                        <div id="mainheading"> <div style={{fontSize: "35px"}}>Departmental Library</div> Management System </div>
                    </div>

                    <div id="navbarcenter">{localStorage.getItem("name") !== undefined ? "Hi, " + localStorage.getItem("name") : ""}</div>            
                </div>

                <div id="booktab">
                    <div id='booktabtitle'>Books</div>

                    {(this.state.book.bookData === undefined) ? <div>No Book founds</div> : this.SetBookGallery()}
                </div>

                <div id="searchtab">
                    <div id="searchtabtitle">Search</div>

                    <div id="searchbar">
                        <input type="text" id="searchinput" placeholder='Try searching book here!' onChange={this.findBook}/>
                    </div>

                    <div id="searchconsole" style={{marginLeft: "50%", transform: "translateX(-50%)", marginTop: "10px"}}></div>

                    {(this.state.searchBook.bookData === undefined) ? <div></div> : this.SetSearch()}
                </div>

                <div id="reporttab">
                    <div id="reporttabtitle">Report</div>
                    
                    <div className="table-wrapper">
                    <table>
                    <thead>
                        <tr>
                        <th></th>
                        <th>Your Borrowed Book</th>
                        <th>Descriptions</th>
                        <th>Barcode</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Return</th>
                        <th>Return Status <span class="tooltip"><svg style={{cursor: "pointer"}}  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/> <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/></svg><span class="tooltiptext"><h4>Check the status of your issued book return:</h4><br />&#8226;Normal : There is no need to return the issued book.<br />&#8226;Please return: It's been more than 26 days and you should return the book in this week.<br />&#8226;Late: It's been 30 days from the issued date. This is the reminder to return the book on working day. <br />&#8226;Over Late: It's been more than 46 days from the issued date. You should return the repective book as soon as possible. It is last reminder.  </span> </span></th>
                        </tr>
                    </thead>
                            {(this.state.reportData.length === 0) ? <tbody><tr>No Report data available</tr></tbody> : this.SetReportData()}
                    </table>
                    </div>

                </div>

                <div id="borrowtab" className='borrowtabclose'>
                    <div id='borrowtitle'>Borrow Tab</div>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <div id="borrowimage" style={{backgroundImage: `url(${this.state.urlPosterBorrow})`}}></div>
                            <div style={{display: "flex", flexDirection: "column", marginTop:"7%"}}>
                                <div id="borrowname"><span style={{color: "black", marginRight: "10px"}}>Book Name</span><span style={{textAlign: "right", marginLeft: "2.7em"}}>{this.state.borrowname}</span></div>
                                <div id="borrrowdescription"><span style={{color: "black", marginRight: "10px"}}>Book Description</span>{this.state.borrowdesc}</div>
                                <div id="borrowname"><span style={{color: "black", marginRight: "10px"}}>Book Barcode</span><span style={{textAlign: "right", marginLeft: "1.55em"}}>{this.state.borrowbarcode}</span></div>
                                
                                {(this.state.borrowdate.length > 0 ? <div id="borrowname"><span style={{color: "black", marginRight: "10px"}}>Borrowed Date</span><span style={{textAlign: "right", marginLeft: "1em"}}>{this.state.borrowdate}</span></div> : "") }

                                <div id="borrowButtongroup" style={{display: "flex", flexDirection: "row"}}>
                                    <input type="button" value="Borrow" id="borrowbutton" onClick={this.borrowClickedbook}/>
                                    <input type="button" value="Cancel" id="cancelbutton" onClick={()=>{document.getElementById('borrowtab').className = "borrowtabclose"; this.setState({borrowdate: ""})}}/>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
  