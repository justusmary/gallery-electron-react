import React, { Component } from 'react';
import Lightbox from 'react-image-lightbox';
import './App.css';
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const imagesDir = require.context('./static', true);



class App extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      photoIndex: 0,
      isOpen: false,
      images: [],
      nave: false
    };
    this.view = this.view.bind(this);
    this.viewImage = this.viewImage.bind(this);
    this.retrieve = this.retrieve.bind(this);
    this.setImages = this.setImages.bind(this);
    
  }

  componentDidMount() {
    this.retrieve()
    setInterval(this.retrieve, 2000);
  }

  view(index) {
    this.setState({
      photoIndex: index.target.id,
      isOpen: true
    });
  }

  retrieve() {
    var set = fs.readdirSync('./src/static');
    if (set.length === this.state.images.length) {return};
    this.setState({
      data: new Array(set.length)
    });
    if (this.state.data.length === 0) {return;}
    this.setState({
      data: set, 
      images: new Array(set.length)
    });
    this.setImages();
  }

  setImages() {
    //console.log(path.resolve(__dirname, "\\static\\media\\"));
    var crap = new Array(this.state.data.length);
    for(var i = 0; i < this.state.data.length; i++) {
      crap[i] = imagesDir("./" + this.state.data[i]);
    }
    this.setState({ images: crap });
  }

  viewImage() {
    return (
      <Lightbox
        mainSrc={this.state.images[this.state.photoIndex]}
        nextSrc={this.state.images[(this.state.photoIndex + 1) % this.state.images.length]}
        prevSrc={this.state.images[(this.state.photoIndex + this.state.images.length - 1) % this.state.images.length]}
        onCloseRequest={() => this.setState({ isOpen: false })}
        onMovePrevRequest={() =>
          this.setState({
            photoIndex: (this.state.photoIndex + this.state.images.length - 1) % this.state.images.length
          })}
        onMoveNextRequest={() =>
          this.setState({
            photoIndex: (this.state.photoIndex + 1) % this.state.images.length
          })}
      />
    );
  }

  render() {
    var id = 0;
    const pictures = this.state.images.map((image) => {
      var name
      if (image) {
        name = this.state.data[id].substring(0, this.state.data[id].length - 4)
      }
      else {
        name = "";
      }
      return(
        <div className="col-sm-6 col-md-4">
          <div className="thumbnail">
              <img id={id++} className="img-responsive clipper" src={image} alt={name} onClick={this.view}/>
            <div className="caption">
              <h3>{name}</h3>
              <p>Description.</p>
            </div>
          </div>
        </div>
      )
    });

    return (
      <div>
        <header className="heading">
          <h1 className="title">Gallery</h1>
        </header>
        <div className="container gallery-container">
          <p className="page-description text-center"></p>
          <div className="tz-gallery">
            <div className="row">
              {pictures}
            </div>
          </div>
        </div>
        {this.state.isOpen && (<this.viewImage/>)}
      </div>
    );
  }
}

export default App;
