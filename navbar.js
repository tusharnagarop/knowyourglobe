import React from 'react';
import './stake.css';
import Progress from 'react-progressbar';
import { ethers, providers } from "ethers";
import values from "../../values.json"
import stakingAbi from '../../abi/staking.json';
import tokenAbi from '../../abi/token.json';
import {provider, setProvider, signer, setSigner} from '../../App';


const Stake = () => {
  let [poolId, setPoolId] = React.useState(0);
  let [poolInfo, setPoolInfo] = React.useState([]);
  let [userInfo, setUserInfo] = React.useState([]);
  let [whitelistedAddresses, setWalletAddresses] = React.useState([]);
  let [amount, setAmount] = React.useState(0);
  let [balance, setBalance] = React.useState(0);
  let [stakingBalance, setStackingBalance] = React.useState(0);
  let [currentPoolSize, setCurrentPoolSize] = React.useState(0);
  let [maxPoolSize, setMaxPoolSize] = React.useState(0);
  let [timeLock, setTimeLock] = React.useState(0);
  let [myerror, setmyerror] = React.useState()
  let _provider = React.useContext (provider);
  let _setProvider = React.useContext (setProvider);
  let _signer = React.useContext (signer);
  let _setSigner = React.useContext (setSigner);

  React.useEffect(()=>{
    getPoolInfo();
    getUserInfo();
    getWhiteListAddresses();
    
    async function fetch (){
      try{
        let _balance = await _getBalance(values.token);
        console.log("BAlance", _balance);
        setBalance(_balance);
      }catch (err){
        console.log("Error", err);
      }
    }
    fetch();
  }, [_provider, _signer, poolId]);

  
  //get info function
  async function getPoolInfo (){
    try{
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        provider_
      );
      var _poolInfo = await staking.poolInfo(poolId);
      console.log ("Pool Info: ", _poolInfo);
      setPoolInfo(_poolInfo);
      let temp = ethers.utils.formatUnits(_poolInfo[2].toString(), decimals).toString()
      console.log ("temp: ", temp, " value: ", _poolInfo[2].toString());
      setCurrentPoolSize(temp);
      temp = ethers.utils.formatUnits(_poolInfo[1].toString(), decimals).toString()
      setMaxPoolSize(temp)

    }catch(err){
      console.log(err);
    }
  }

 
  async function _getBalance (tokenAddress, accountAddress){
    try {
      let rpcUrl = values.rpcUrl;
      let provider_ = new ethers.providers.JsonRpcProvider(rpcUrl);
      let token = new ethers.Contract(
        tokenAddress,
        tokenAbi,
        provider_
      );
      if (!accountAddress){
        accountAddress = await _signer.getAddress();
      }
      let balance = await token.balanceOf (accountAddress);
      console.log ("Balalala", balance)
      let decimals = await token.decimals();
      decimals = parseInt(decimals.toString());
      balance = ethers.utils.formatUnits(balance, decimals);
      return parseFloat(balance.toString()).toFixed(2);
    } catch (err){
      console.log (err, tokenAddress);
      return 0;
    }
  }

  // removed bugs
//get stake tokens function
  async function stakeTokens () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      let _amount = ethers.utils.parseUnits(amount.toString(), decimals);
      // console.log (_amount)
      let tx = await staking.stakeTokens(poolId, _amount);
      await tx.wait();
      getPoolInfo();
      getUserInfo();
    }catch (error) {
      if (error.data)
      alert(error.data.message);
      console.log (error)
    }
  }

  async function unstakeTokens () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      let tx = await staking.unstakeTokens(poolId);
      await tx.wait();
      getPoolInfo();
      getUserInfo();
    }catch (error) {
      if (error.data)
      alert(error.data.message);
      console.log (error);
    }
  }

  async function claimTokens () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      let tx = await staking.claimTokens(poolId);
      await tx.wait();
      getPoolInfo();
      getUserInfo();
    }catch (error) {
      if (error.data)
      alert(error.data.message);
      console.log (error);
    }
  }

  async function emergencyWithdraw () {
    try{
      let staking = new ethers.Contract(
        values.stakingAddress,
        stakingAbi,
        _signer
      );
      let tx = await staking.emergencyWithdraw(poolId);
      await tx.wait();
      getPoolInfo();
      getUserInfo();
    }catch (error) {
      if (error.data)
      alert (error.data.message);
      console.log (error);
    }
  }

  async function approve () {
    try{
      let token = new ethers.Contract(
        values.token,
        tokenAbi,
        _signer
      );
      let _amount = ethers.utils.parseUnits("10000000000000000000", decimals);
      let tx = await token.approve(values.stakingAddress, _amount);
      await tx.wait();
      stakeTokens()
    }catch (error) {
      // alert(error.data.message);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setAmount(value);
    // console.log (amount);
  }


  const decimals = 18;

  return (
    <div>

    <div className='landing'>
        <div className='stak_box'>  
            <div className='stak_heading'>
                <h2>STAKE YOUR TOKEN</h2>
            </div>
            <div className='stak_bar'>
            <Progress color="#339CEE" completed={(parseFloat(currentPoolSize)* 100)/parseFloat(maxPoolSize)} height={20} data-label={`${(parseFloat(currentPoolSize)* 100)/parseFloat(maxPoolSize)}% Pool Filled`} />
            </div>
            {/* <Timer /> */}
            <div className='stak_info'>
            <p>Estimated APY : <span className='text-blue'>{`10.36%`}</span></p>
            <p>My Balance : <span className='text-blue'>{balance}</span> </p>
            <p>My Stakable Balance :  <span className='text-blue'>{stakingBalance}</span></p>
            </div>  

            <div className='inputs'>
         
            <div className='inputbox'>
            <div>
            <label>Stake Your Token</label>
            </div>
            <div className="input1">
            <input placeholder='Enter Token Amount' onChange= {(e)=> handleChange(e)} value= {amount} type="number" />
                <div className='maxToken'>
                <p onClick= {()=> setAmount(balance)} >MAX</p>
                </div>
                </div>
                <div className='inputbox'>
                {/* <div>
                <label>Staked Token</label>
                </div>
                <input placeholder={`Show Staked Amount`} readOnly/> */}
            </div>
            </div>
            </div>


            <div className='stak_info'>
            <p>Current Pool Size :  <span className='text-blue'>{currentPoolSize}</span></p>
            <p className='text-red'> {myerror}</p>
            
            {/* <p>My Total Claimed Token : <span className='text-blue'>{`632123`}</span></p>
            <p>Unstake Fee : <span className='text-blue'>{`0%`}</span></p> */}
            </div>
            <div className='all_buttons'>
                <button className='greenButton' onClick={approve} >STAKE</button>
                <button className='greenButton'onClick={claimTokens} >CLAIM</button>
                <button className='greenButton' onClick={unstakeTokens}>UNSTAKE</button>
                <button className='redbutton' onClick={emergencyWithdraw}>EMERGENCY UNSTAKE</button>
            </div> 
            </div>
    </div>
    </div>
  )
}

export default Stake
