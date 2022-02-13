import React, { Component } from 'react';
import Web3 from 'web3';
import Navbar from './Navbar'
import Main from './Main'
import './App.css';
import Color from '../abis/Color.json'
import MemEthereum from '../abis/MemEthereum.json'

// const { create } = require('ipfs-http-client');

// const ipfs = window.IpfsHttpClient({ host: 'localhost', port: 5001 });
// const ipfsClient = require('ipfs-http-client');
// const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

// const IpfsHttpClient = require('ipfs-http-client')
// const { globSource } = IpfsHttpClient
// const ipfs = IpfsHttpClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

// const ipfsClient  = require('ipfs-http-client');
// const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });
import { create } from "ipfs-http-client";

const ipfs = create('https://ipfs.infura.io:5001/api/v0');
class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = Color.networks[networkId]
    if(networkData) {
      const abi = Color.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
      const totalSupply = await contract.methods.totalSupply().call()
      this.setState({ totalSupply })
      // Load Colors
      for (var i = 1; i <= totalSupply; i++) {
        const color = await contract.methods.colors(i - 1).call()
        this.setState({
          colors: [...this.state.colors, color]
        })
      }
      const memEthereum = new web3.eth.Contract(MemEthereum.abi, networkData.address)    
      this.setState({ memEthereum })                                     
      const imagesCount = await memEthereum.methods.imageCount().call()         
      this.setState({ imagesCount })
      for (var i = 1; i <= imagesCount; i++) {
        const image = await memEthereum.methods.images(i).call()                
        this.setState({
          images: [...this.state.images, image]
        })
      }
    }else{
      window.alert('Contracts not deployed to detected network.')

    }
  }

  mint = (color) => {
    this.state.contract.methods.mint(color).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({
        colors: [...this.state.colors, color]
      })
    })
  }

  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  uploadImage = () => {
    console.log("Submitting file to ipfs...")

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })   //24
      this.state.memEthereum.methods.uploadImage(result[0].hash).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      contract: null,
      memEthereum:null,
      totalSupply: 0,
      colors: [],
      images:[],
      loading:true
    }

    this.uploadImage = this.uploadImage.bind(this)
    this.captureFile = this.captureFile.bind(this)
  }

  render() {
    return (
      <div>
        <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              images={this.state.images}
              captureFile={this.captureFile}
              uploadImage={this.uploadImage}
            />
        }
      </div>
      <h1>OR</h1>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const color = this.color.value
                  this.mint(color)
                }}>
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='e.g. #FFFFFF'
                    ref={(input) => { this.color = input }}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='MINT'
                  />
                </form>
              </div>
            </main>
          </div>
          <hr/>
          <div className="row text-center">
            { this.state.colors.map((color, key) => {
              return(
                <div key={key} className="col-md-3 mb-3">
                  <div className="token" style={{ backgroundColor: color }}></div>
                  <div>{color}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
