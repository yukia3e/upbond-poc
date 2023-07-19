import { useEffect, useState } from "react";
import Upbond, { UserInfo } from "@upbond/upbond-embed";
import Web3, { TransactionReceipt } from "web3";
import upbondServices from "@/lib/UpbondEmbed";
import toast from "react-hot-toast";

export default function useUpbond() {
  const [upbond, _setUpbond] = useState<Upbond>(new Upbond({}));
  const [loading, setLoading] = useState<boolean>(false);
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

  const upbondProvider = upbondServices.upbond.provider;

  // check if user is logged in
  useEffect(() => {
    const rehydrate = async () => {
      console.log("rehydrate started");
      const web3 = new Web3(upbondProvider);
      const accs = await web3.eth.getAccounts();
      console.log(`web3Accounts: `, accs);
      if (accs.length > 0) {
        setAccount(accs);
      }
      console.log("rehydrate ended");
    };

    if (upbondProvider) {
      rehydrate();
    }
  }, [upbondProvider]);

  // init Upbond
  useEffect(() => {
    const initUpbond = async () => {
      console.log(`Initializing Upbond...`);
      setLoading(true);
      try {
        await upbondServices.init("/hooks");
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
    if (upbondProvider) {
      console.log("_upbond.selectedAddress:", upbondProvider.selectedAddress);
    }
  }, [upbondProvider]);

  const bigIntToNumber = (bigInt: bigint) => {
    return Number(bigInt.toString());
  };

  const getBlockchainInfo = async (refresh = false) => {
    console.log(`Getting blockchain info...`)
    if (!refresh && showBc) {
      setShowBc(false);
      return;
    }
    const web3 = new Web3(upbondProvider);
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
    console.log("signTransaction _upbond", upbondProvider);
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
      const signedMsg = await upbondServices.signWeb3Token(account[0]);
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
      const web3 = new Web3(upbondProvider);
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
      console.log(`initLayout Initializing`, upbondProvider);
      if (upbondProvider) {
        setLoading(true);
        const web3 = new Web3(upbondProvider);
        const account = await web3.eth.getAccounts();
        setAccount(account);
        if (!account || account.length !== 0) {
          upbondServices.isLoggedIn = true;
        }
        setLoading(false);
      }
      console.log(`initLayout Initialized!`);
    };
    initLayout();
  }, [upbondProvider]);

  useEffect(() => {
    console.log(`Upbond start: `, upbondProvider);
    if (upbondProvider) {
      if (upbondProvider.on) {
        upbondProvider.on("accountsChanged", (accounts) => {
          setAccount(accounts as string[]);
          console.log(`Account changed: ${accounts}`);
        });

        upbondProvider.on("chainChanged", (res) => {
          console.log(`Chain changed on: ${res}`);
        });

        upbondProvider.on("connect", (res) => {
          console.log("onConnect?", res);
        });
      }
    }
    console.log(`Upbond end: `, upbondProvider);
  }, [upbondProvider]);

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
          }
          }
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

  const signIn = async () => {
    await upbondServices.login();
  };

  const signOut = async () => {
    await upbondServices.logout();
  };

  return {
    account,
    loading,
    signInfo,
    btnLoading,
    isCopy,
    txResult,
    bcState,
    userInfo,
    isShowUserInfo,
    showBc,
    signIn,
    signOut,
    getUser,
    getBlockchainInfo,
    signTransaction,
    signWeb3Token,
    deploy,
    setIsCopy
  };
}