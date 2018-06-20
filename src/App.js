import React, { Component } from 'react'
import Lightbox from 'react-image-lightbox'
import './App.css'
import { Button, Breadcrumb } from 'react-bootstrap'
import notEmpty from './icons/notEmpty.ico'
import Empty from './icons/Empty.ico'
import noMedia from './icons/noMedia.ico'
const electron = window.require('electron')
const fs = electron.remote.require('fs')
const dialog = electron.remote.dialog
const app = electron.remote.app

class App extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      dir: app.getPath("pictures").replace(/\\/g, '/') + '/',
      lastDir: '',
      data: [],
      folders: [],
      photoIndex: 0,
      isOpen: false,
      images: [],
    }

    this.view = this.view.bind(this)
    this.viewImage = this.viewImage.bind(this)
    this.retrieve = this.retrieve.bind(this)
    this.setImages = this.setImages.bind(this)
    this.selectDirectory = this.selectDirectory.bind(this)
    this.backwardTo = this.backwardTo.bind(this)
    this.forwardTo = this.forwardTo.bind(this)
  }

  componentDidMount() {
    this.retrieve()
    setInterval(this.retrieve, 30000)
  }

  retrieve() {
    var mediaPath = this.state.dir
    var set = fs.readdirSync(mediaPath)
    var fixedSet = this.validate(set)
    if (fixedSet.length === this.state.images.length && this.state.dir === this.state.lastDir) { return }
    this.setState({
      data: fixedSet,
      lastDir: this.state.dir
    }, 
    () => {
      this.setImages()
    })
  }

  validate(fileNames) {
    var folders = []
    var pictures = []
    var found = 0
    for (var i = 0, len = fileNames.length; i < len; i++) {
      try {
        var stats = fs.statSync(this.state.dir + fileNames[i])
      }
      catch (err) {
        continue
      }
      if (stats.isDirectory()) {
        try {
          var set = fs.readdirSync(this.state.dir + fileNames[i])
        }
        catch(err) {
          continue
        }
        for (var m = 0, length = set.length; m < length; m++) {
          try{
            var stat = fs.statSync(this.state.dir + fileNames[i] + '/' + set[m])
          }
          catch(err) {
            continue
          }
          if (stat.isDirectory()) {
            found = 2
            continue
          }
          var Dot = set[m].lastIndexOf('.')
          if (Dot === -1) continue
          var Ext = set[m].substring(Dot + 1, set[m].length)
          if (Ext == 'jpg' || Ext == 'png' || Ext == 'jpeg' || Ext == 'bmp' || Ext == 'gif') {
            found = 1
            break
          }
        }
        if (found === 0) {
          folders.push([fileNames[i], Empty])
        }
        if (found === 1) {
          folders.push([fileNames[i], notEmpty])
        }
        if (found === 2) {
          folders.push([fileNames[i], noMedia])
        }
        found = 0
        continue
      }
      
      var dot = fileNames[i].lastIndexOf('.')
      if (dot === -1) continue

      var ext = fileNames[i].substring(dot + 1, fileNames[i].length)
      if (ext == 'jpg' || ext == 'png' || ext == 'jpeg' || ext == 'bmp' || ext == 'gif') {
        pictures.push(fileNames[i])
      }
    }
    this.setState ({
      folders: folders
    })
    return pictures
  }

  setImages() {
    var temp = new Array(this.state.data.length)
    for(var i = 0; i < this.state.data.length; i++) {
      temp[i] = 'file:///' +  this.state.dir + this.state.data[i]
    }
    this.setState({ images: temp }, () => { return })
  }

  backwardTo(id) {
    id.preventDefault()
    var index = (depth) => {
      var len = this.state.dir.length, i = -1
      while (depth-- && i++<len) {
        i = this.state.dir.indexOf('/', i)
        if (i < 0) break
      }
      return i
    }
    var boundary = index(parseInt(id.target.id, 10) + 1) + 1
    this.setState({
      dir: this.state.dir.substring(0, boundary)
    }, () => { this.retrieve() })
    
  }

  forwardTo(id) {
    id.preventDefault()
    this.setState({
      dir: this.state.dir + this.state.folders[id.target.id][0] + '/'
    }, () => { this.retrieve() })
  }

  selectDirectory() {
    var window
    try {
      var directory = dialog.showOpenDialog(window, {
        properties: ['openDirectory']
      })[0]
    }
    catch (error) { return }
    var fullPath = directory.replace(/\\/g, '/') + '/'
    this.setState({ dir: fullPath }, () => {
      this.retrieve()
    })
  }

  view(index) {
    index.preventDefault()
    this.setState({
      photoIndex: index.target.id,
      isOpen: true
    }, () => {  })
  }

  viewImage() {
    return (
      <Lightbox
        mainSrc={this.state.images[this.state.photoIndex]}
        nextSrc={this.state.images[(this.state.photoIndex) % this.state.images.length]}
        prevSrc={this.state.images[(this.state.photoIndex + this.state.images.length - 1) % this.state.images.length]}
        onCloseRequest={() => this.setState({ isOpen: false })}
        onMovePrevRequest={() => 
          this.setState({
            photoIndex: (parseInt(this.state.photoIndex, 10) + this.state.images.length - 1) % this.state.images.length
          }, () => {})}
        onMoveNextRequest={() =>
          this.setState({
            photoIndex: (parseInt(this.state.photoIndex, 10) + 1) % this.state.images.length
          }, () => { })}
      />
    )
  }

  

  render() {
    var id = 0, index = 0, identity = 0
    const pictures = this.state.images.map((image) => {
      var name
      try { name = this.state.data[id].substring(0, this.state.data[id].length - 4) }
      catch(error) { return null }
      return(
        <div className="col-sm-4 col-md-3 col-lg-2">
          <div className="thumbnail">
              <img id={id++} className="img-responsive clipper" src={image} alt={name} onClick={this.view}/>
            
          </div>
        </div>
      )
    })

    const path = this.state.dir.split('/').map((folder) => {
      if (index === this.state.dir.split('/').length - 2) {
        return(
          <Breadcrumb.Item active>{folder}</Breadcrumb.Item>
        )
      }
      return(
        <Breadcrumb.Item id={index++} onClick={this.backwardTo}>{folder}</Breadcrumb.Item>
      )
    })

    const folders = this.state.folders.map((folder) => {
      return(
        <div className="col-sm-4 col-md-3 col-lg-2">
          <div className="folder">
              <img id={identity++} className="folder-icon" src={folder[1]} alt={folder[0]} onClick={this.forwardTo}/>
            <div className="caption">
              <h3>{folder[0].substring(0, 20)}</h3>
            </div>
          </div>
        </div>
      )
    })

    return (
      <div>
        <header className="heading">
          <h1 className="title">Picture Viewer</h1>
        </header>
        <div className="container">
          <Breadcrumb>
            {path}
          </Breadcrumb>
          <Button  bsStyle="primary" className="select" onClick={this.selectDirectory}>Select Folder</Button>
        </div>
        <div className="container gallery-container">
          <p className="page-description text-center"></p>
          <div className="tz-gallery">
            <div className="row">
              {folders}
              {pictures}
            </div>
          </div>
        </div>
        {this.state.isOpen && (<this.viewImage/>)}
      </div>
    )
  }
}

export default App
