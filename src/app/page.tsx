'use client';

import upbondServices from '@/lib/UpbondEmbed';
import { UserInfo } from '@upbond/upbond-embed';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Web3, { TransactionReceipt } from 'web3';
import SpinnerLoading from "@/components/SpinnerLoading";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<string[] | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null | undefined>(null);
  const [signInfo, setSignInfo] = useState<string | null | undefined>(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [isShowUserInfo, setIsShowUserInfo] = useState(false);
  const [showBc, setShowBc] = useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const [txResult, setTxResult] = useState<TransactionReceipt | null>(null);
  const [bcState, setBcState] = useState({
    address: "",
    chainId: 0,
    balance: 0,
  });

  const _upbond = upbondServices.upbond.provider;

  useEffect(() => {
    const rehydrate = async () => {
      console.log("rehydrate started");
      const web3 = new Web3(_upbond);
      const accs = await web3.eth.getAccounts();
      console.log(`web3Accounts: `, accs);
      if (accs.length > 0) {
        setAccount(accs);
      }
      console.log("rehydrate ended");
    };

    if (_upbond) {
      rehydrate();
    }
  }, [_upbond]);

  useEffect(() => {
    const initUpbond = async () => {
      console.log(`Initializing Upbond...`);
      setLoading(true);
      try {
        await upbondServices.init();
      } catch (error) {
        console.error(`Error initialization: `, error);
      }
      setLoading(false);
      console.log(`Upbond initialized!`);
    };
    if (upbondServices.initialized) {
      return;
    }
    initUpbond();
  }, []);

  useEffect(() => {
    if (_upbond) {
      console.log("_upbond.selectedAddress:", _upbond.selectedAddress);
    }
  }, [_upbond]);

  const bigIntToNumber = (bigInt: bigint) => {
    return Number(bigInt.toString());
  };

  const getBlockchainInfo = async (refresh = false) => {
    console.log(`Getting blockchain info...`)
    if (!refresh && showBc) {
      setShowBc(false);
      return;
    }
    const web3 = new Web3(_upbond);
    const [accounts, chainId] = await Promise.all([
      web3.eth.getAccounts(),
      web3.eth.getChainId(),
    ]);
    if (accounts) {
      const balance = await web3.eth.getBalance(accounts[0]);
      setShowBc(true);
      setBcState({
        address: accounts[0],
        balance: bigIntToNumber(balance),
        chainId: bigIntToNumber(chainId),
      });
    }
    console.log(`Blockchain info fetched!`)
  };

  const login = async () => {
    console.log("login started")
    setLoading(true);
    try {
      const login = await upbondServices.login();
      if (!login || login.data !== null) {
        setAccount(null);
        setLoading(false);
        return;
      }
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Some error occured");
      setLoading(false);
      console.error(error);
      throw new Error(error);
    }
    console.log("login ended")
  };

  const getUser = async () => {
    console.log("getUser started")
    if (isShowUserInfo) {
      setIsShowUserInfo(false);
      return;
    }
    setLoading(true);
    try {
      const getData = await upbondServices.getUserInfo();
      setUserInfo(getData);
      setIsShowUserInfo(true);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Some error occured");
      console.error(error, "@errorOnGetUser");
      setIsShowUserInfo(true);
      setLoading(false);
    }
    console.log("getUser ended")
  };

  const signTransaction = async () => {
    console.log("signTransaction started")
    console.log("signTransaction _upbond", _upbond);
    try {
      setBtnLoading(true);
      setIsCopy(false);
      setLoading(true);
      const msgHash = Web3.utils.keccak256(
        "Signing Transaction for Upbond Embed!"
      );
      if (!account || account.length === 0) {
        toast.error("Please login first!");
        setBtnLoading(false);
        setLoading(false);
        return;
      }
      const signedMsg = await upbondServices.signTransaction(
        msgHash,
        account[0]
      );
      console.log(signedMsg);
      setSignInfo(signedMsg as string);
      setBtnLoading(false);
    } catch (error: any) {
      setBtnLoading(false);
      toast.error(error.message || "Some error occured");
      console.error(error);
      setLoading(false);
    }
    console.log("signTransaction ended")
  };

  const signWeb3Token = async () => {
    console.log("signWeb3Token started")
    try {
      setBtnLoading(true);
      setIsCopy(false);
      if (!account || account.length === 0) {
        toast.error("Please login first!");
        setBtnLoading(false);
        return;
      }
      const signedMsg = await upbondServices.signWeb3Token();
      if (signedMsg) {
        setBtnLoading(false);
        setSignInfo(`${signedMsg}`);
      } else {
        setBtnLoading(false);
        setSignInfo("Output error. Maybe rejected or provider is invalid");
      }
    } catch (error: any) {
      setBtnLoading(false);
      toast.error(error.message || "Some error occured");
    }
    console.log("signWeb3Token ended")
  };

  const deploy = async () => {
    console.log("deploy started")
    try {
      setBtnLoading(true);
      const web3 = new Web3(_upbond);
      const [addr] = await web3.eth.getAccounts();
      const nonce = await web3.eth.getTransactionCount(addr);

      if (!account || account.length === 0) {
        toast.error("Please login first!");
        setBtnLoading(false);
        return;
      }

      const transaction = {
        from: addr,
        to: account[0],
        value: 100000000000000000,
        gas: 30000,
        nonce: nonce,
      };

      const tx = await web3.eth.sendTransaction(transaction);

      // The operand of a 'delete' operator cannot be a read-only property.
      // delete tx.logs;
      // delete tx.contractAddress;

      setTxResult(tx);
      setBtnLoading(false);
    } catch (error: any) {
      setBtnLoading(false);
      console.error(error);
      toast.error(error.message || "Error occured!");
    }
    console.log("deploy ended")
  };

  useEffect(() => {
    const initLayout = async () => {
      console.log(`Initializing`, upbondServices.upbond.provider);
      if (upbondServices.upbond.provider) {
        setLoading(true);
        const web3 = new Web3(upbondServices.upbond.provider);
        const account = await web3.eth.getAccounts();
        setAccount(account);
        setLoading(false);
      }
      console.log(`Initialized!`)
    };
    initLayout();
  }, [upbondServices.upbond.provider]);

  useEffect(() => {
    console.log(`Upbond start: `, _upbond);
    if (_upbond) {
      if (_upbond.on) {
        _upbond.on("accountsChanged", (accounts) => {
          setAccount(accounts as string[]);
          console.log(`Account changed: ${accounts}`);
        });

        _upbond.on("chainChanged", (res) => {
          console.log(`Chain changed on: ${res}`);
        });

        _upbond.on("connect", (res) => {
          console.log("onConnect?", res);
        });
      }
    }
    console.log(`Upbond end: `, _upbond);
  }, [_upbond]);

  const ProfileImage = () => {
    if (userInfo && userInfo.profileImage) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="inline-block h-14 w-14 rounded-full"
          alt={userInfo.name}
          src={userInfo.profileImage}
          onError={({ currentTarget }) => {
            currentTarget.src = "http://localhost:3000/default-photo.svg";
            currentTarget.onerror = null;
          }}
        />
      );
    } else {
      return (
        (
          // eslint-disable-next-line @next/next/no-img-element
          userInfo ? <img
            className="inline-block h-14 w-14 rounded-full"
            alt={userInfo.name}
            src="http://localhost:3000/default-photo.svg"
          /> : <></>
        )
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
      <header className="App-header">
        <p className="text-center text-xl font-bold my-3 lg:text-2xl">
          Demo of UPBOND in DApps
        </p>
        <div className="mt-4 w-full px-4 flex justify-center">
          <p className="text-center">
            See how UPBOND can be embedded in your dapp.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="http://localhost:3000/upbondbanner.png"
          className="w-1/2 mx-auto rounded-xl m-5"
          alt="UpbondBanner"
        />
        {account && account.length > 0 ? (
          <div>
            <p className="text-center">Account : {account}</p>

            <div className="flex justify-center mt-3 gap-3">
              <button
                type="button"
                disabled={btnLoading}
                className="items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={getUser}
              >
                Toggle User Info
              </button>
              <button
                type="button"
                disabled={btnLoading}
                className="items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => getBlockchainInfo(false)}
              >
                Toggle blockchain info
              </button>
              <button
                type="button"
                disabled={btnLoading}
                className="items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={async () => await upbondServices.logout()}
              >
                Logout
              </button>
            </div>
            {/* User Info */}
            {userInfo && isShowUserInfo && (
              <div className="text-center my-3">
                <p className="font-bold">User Info</p>
                <ProfileImage />
                <p>Name: {userInfo.name}</p>
                <p>Email: {userInfo.email}</p>
                <p>Login with: {userInfo.typeOfLogin}</p>
                <p>Verifier: {userInfo.verifier}</p>
              </div>
            )}
            {/* bc info */}
            {showBc && bcState.chainId !== 0 && (
              <div className="text-center my-3">
                <p className="font-bold">Blockchain Info</p>
                {Object.keys(bcState).map((x) => (
                  <p className="text-black" key={x}>
                    {x}: {bcState[x as keyof typeof bcState]}
                  </p>
                ))}
              </div>
            )}
            <div className="flex flex-1 justify-center space-x-5 mt-2">
              <button
                type="button"
                disabled={btnLoading}
                className="disabled:bg-gray-500 items-center px-4 py-2 text-sm font-medium rounded-xl shadow-sm text-white bg-[#4B68AE] hover:bg-[#214999] border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={signTransaction}
              >
                Sign Transaction
              </button>
              <button
                type="button"
                disabled={btnLoading}
                className="disabled:bg-gray-500 items-center px-4 py-2 text-sm font-medium rounded-xl shadow-sm text-white bg-[#4B68AE] hover:bg-[#214999] border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B68AE]"
                onClick={signWeb3Token}
              >
                Sign Web3Token
              </button>
              <button
                type="button"
                disabled={btnLoading}
                className="disabled:bg-gray-500 items-center px-4 py-2 text-sm font-medium rounded-xl shadow-sm text-white bg-[#4B68AE] hover:bg-[#214999] border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B68AE]"
                onClick={deploy}
              >
                Send Transaction
              </button>
            </div>
            <p className="text-black mt-5">Output: </p>
            <div className="overflow-hidden rounded-lg bg-white shadow mt-2">
              <div className="px-4 py-5 sm:p-6 whitespace-pre-line break-words">
                {signInfo ? signInfo : "Nothing"}
              </div>
            </div>
            {signInfo && (
              <button
                type="button"
                className="inline-flex mt-5 items-center px-3 py-1.5 text-xs font-medium rounded-full shadow-sm text-white bg-[#4B68AE] hover:bg-[#214999] border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B68AE]"
                onClick={async () => {
                  await navigator.clipboard.writeText(signInfo);
                  setIsCopy(true);
                }}
              >
                {isCopy ? "Copied" : "Copy"}
              </button>
            )}
            {txResult && Object.keys(txResult).length > 0 && (
              <p className="text-black mt-5">Transaction Output: </p>
            )}
            {txResult && Object.keys(txResult!).map((x) => (
              <div
                className="overflow-hidden rounded-lg bg-white shadow mt-2"
                key={x}
              >
                <div className="px-4 py-5 sm:p-6 whitespace-pre-line break-words">
                  {/* @ts-ignore */}
                  {x}: {txResult[x as keyof typeof txResult]}
                </div>
              </div>
            )
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            {loading === true ? (
              <SpinnerLoading />
            ) : (
              <div className="flex flex-1 flex-col space-y-3">
                <button
                  type="button"
                  className="mx-auto px-4 py-2 text-sm font-medium rounded-xl shadow-sm text-white bg-[#4B68AE] hover:bg-[#214999] border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B68AE]  w-1/4"
                  onClick={login}
                >
                  Login 3.0
                </button>
              </div>
            )}
          </div>
        )}
      </header>
      <Toaster
        toastOptions={{
          className: "toaster",
        }}
        position="top-center"
        reverseOrder={false}
      />
    </div>
  );
}
