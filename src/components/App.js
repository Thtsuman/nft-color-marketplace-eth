import React from 'react';
import './App.css';
import Web3 from 'web3'
import Color from '../abis/Color.json'

const App = () => {

  const [account, setAccount] = React.useState('')
  const [colorContract, setColorContract] = React.useState(null)
  const [totalColorSupply, setTotalColorSupply] = React.useState(0)
  const [colors, setColors] = React.useState([])
  const [formData, setFormData] = React.useState({
    color: ""
  })

  React.useEffect(() => {
    loadWeb3()
    getBlockchainData()
  }, [])

  const getBlockchainData = async () => {
    const web3 = window.web3;
    // load account
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])

    const networkId = await web3.eth.net.getId()
    const networkData = Color.networks[networkId]
    if (networkData) {
      const abi = Color.abi;
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address)

      setColorContract(contract)

      // get totalSupply
      const totalSupply = await contract.methods.totalSupply().call()
      setTotalColorSupply(totalSupply)

      // get colors
      let color;
      let colorArray = [];
      for (var i = 1; i <= totalSupply; i++) {
        color = await contract.methods.colors(i - 1).call()
        colorArray = [...colorArray, color]
      }

      setColors(colorArray)

      console.log(contract)
    } else {
      window.alert('Smart contract not deployed to detected network')
    }
  }

  const loadWeb3 = async () => {
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

  const handleChangeFormData = (e) => {
    e.preventDefault();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddToken = (e) => {
    e.preventDefault();
    // create a new color
    colorContract.methods.mint(formData.color).send({
      from: account
    }).once('receipt', (receipt) => {
      setColors([...colors, formData.color])
    })
  }

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="http://www.dappuniversity.com/bootcamp"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dapp University
        </a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-white"><span id="account">{account}</span></small>
          </li>
        </ul>
      </nav>
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <h4>Issue Token</h4>
              <form onSubmit={handleAddToken}>
                <input 
                  value={formData.color}
                  onChange={handleChangeFormData} 
                  name='color'
                  type="text" 
                  className='form-control mb-1' 
                  placeholder="#ffffff"
                />
                <button type='submit' className='btn btn-primary btn-block'>Mint</button>
              </form>
            </div>
          </main>
        </div>
        <hr />
        <div className="row text-center">
          {colors.map((color, index) => (
            <div className='col-md-3 mb-3' key={index}>
              <div className='token' style={{ backgroundColor: color }}></div>
              <div>{color}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default App;
