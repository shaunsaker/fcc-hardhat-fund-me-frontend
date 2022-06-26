// TODO: hmm this sucks, what if the contract's ABI or address changes?
// TODO: "WARNING: unsupported ABI type - error", "WARNING: unsupported ABI type - receive"
import { ABI, CONTRACT_ADDRESS } from "./constants.js"

function isMetamaskSupported() {
  return typeof window.ethereum !== "undefined"
}

const connectButton = document.getElementById("connectButton")
const balanceButton = document.getElementById("balanceButton")
const fundButton = document.getElementById("fundButton")
const withdrawButton = document.getElementById("withdrawButton")

async function connect() {
  if (isMetamaskSupported()) {
    try {
      // connect to metamask accounts
      await window.ethereum.request({ method: "eth_requestAccounts" })

      connectButton.innerHTML = "Connected!"
    } catch (error) {
      console.error(error)
    }
  } else {
    connectButton.innerHTML = "Please install metamask!"
  }
}

connectButton.onclick = connect

async function getBalance() {
  if (isMetamaskSupported()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(CONTRACT_ADDRESS)
    console.log(ethers.utils.formatEther(balance))
  }
}

balanceButton.onclick = getBalance

async function fund() {
  const ethAmount = document.getElementById("ethEmount").value || "0.5"
  console.log(`Funding with #${ethAmount}...`)

  if (isMetamaskSupported()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })

      await listenForTransactionMined(transactionResponse, provider)
    } catch (error) {
      console.error(error)
    }
  }
}

fundButton.onclick = fund

function listenForTransactionMined(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)

  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        // TODO: transactionReceipt.confirmations is undefined
        console.log(`Completed with ${transactionReceipt.nonce} nonce!`)

        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}

async function withdraw() {
  if (isMetamaskSupported()) {
    console.log(`Withdrawing...`)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

    try {
      const transactionResponse = await contract.withdraw()

      await listenForTransactionMined(transactionResponse, provider)
    } catch (error) {
      console.error(error)
    }
  }
}

withdrawButton.onclick = withdraw
